import React, { useEffect, useRef, useState, useCallback } from 'react';

let L = null; // Leaflet loaded lazily to avoid SSR issues

/**
 * AddressMap — shows an OpenStreetMap with a draggable marker.
 *
 * Props:
 *   address  – string to geocode (built from address fields)
 *   onPick   – called with { lat, lon, display_name, address } when user drops the marker
 */
const AddressMap = ({ address, onPick }) => {
    const containerRef = useRef(null);
    const mapRef       = useRef(null);
    const markerRef    = useRef(null);
    const isInitializingRef = useRef(false);
    const [status, setStatus]     = useState(''); // '' | 'searching' | 'not_found'

    // ── Initialise map once ───────────────────────────────────
    useEffect(() => {
        if (mapRef.current || isInitializingRef.current) return; // already initialised
        isInitializingRef.current = true;

        // Dynamically import Leaflet so it doesn't break SSR
        import('leaflet').then((leaflet) => {
            if (!containerRef.current || (containerRef.current && containerRef.current._leaflet_id)) return;
            L = leaflet.default || leaflet;

            // Fix default icon paths (Vite breaks them otherwise)
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            const map = L.map(containerRef.current, {
                center: [20.5937, 78.9629], // India centre
                zoom: 5,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            // Draggable marker at India centre
            const marker = L.marker([20.5937, 78.9629], { draggable: true }).addTo(map);

            marker.on('dragend', async () => {
                const { lat, lng } = marker.getLatLng();
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    if (onPick) onPick({ lat, lon: lng, display_name: data.display_name, address: data.address });
                } catch (_) {}
            });

            mapRef.current    = map;
            markerRef.current = marker;
        });

        return () => {
            isInitializingRef.current = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Geocode whenever address string changes ───────────────
    const geocode = useCallback(async (query) => {
        if (!query || query.trim().length < 5 || !mapRef.current || window._nominatimBlocked) return;

        setStatus('searching');
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
                { headers: { 'Accept-Language': 'en' } }
            );

            if (res.status === 429) {
                window._nominatimBlocked = true;
                setStatus('rate_limited');
                return;
            }

            const results = await res.json();

            if (results.length === 0) {
                setStatus('not_found');
                return;
            }

            const { lat, lon, display_name } = results[0];
            const latlng = [parseFloat(lat), parseFloat(lon)];

            mapRef.current.setView(latlng, 15, { animate: true });
            markerRef.current.setLatLng(latlng)
                .bindPopup(display_name)
                .openPopup();

            setStatus('');
            if (onPick) onPick({ lat: parseFloat(lat), lon: parseFloat(lon), display_name, address: results[0] });
        } catch (error) {
            // A CORS error caused by a 429 usually throws a TypeError in fetch
            window._nominatimBlocked = true;
            setStatus('rate_limited');
        }
    }, [onPick]);

    // Debounce geocoding by 2000 ms when address prop changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (address && address.length > 5) {
                geocode(address);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [address, geocode]);

    return (
        <div style={{ position: 'relative' }}>
            {/* Leaflet CSS injected inline */}
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

            {status === 'searching' && (
                <div style={{
                    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'white', padding: '4px 12px',
                    borderRadius: 20, fontSize: 12, color: '#2b6cb0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
                }}>
                    🔍 Searching location…
                </div>
            )}
            {status === 'not_found' && (
                <div style={{
                    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'white', padding: '4px 12px',
                    borderRadius: 20, fontSize: 12, color: '#e53e3e',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
                }}>
                    ⚠️ Location not found — try a different address
                </div>
            )}
            {status === 'rate_limited' && (
                <div style={{
                    position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, background: 'white', padding: '4px 12px',
                    borderRadius: 20, fontSize: 12, color: '#e53e3e',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap'
                }}>
                    ⏳ Rate limit exceeded. Please wait 5 minutes before searching.
                </div>
            )}

            <div
                ref={containerRef}
                style={{ width: '100%', height: '240px', borderRadius: 4 }}
            />
            <div style={{ fontSize: 11, color: '#718096', marginTop: 4, textAlign: 'right' }}>
                📌 Drag the marker to fine-tune the location
            </div>
        </div>
    );
};

export default AddressMap;
