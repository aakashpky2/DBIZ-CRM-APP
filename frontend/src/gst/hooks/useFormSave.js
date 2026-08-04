import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export const useFormSave = (tabName, nextPath) => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadedData, setLoadedData] = useState(null);

    // Provide a TRN if user is logged in, else use a guest TRN 
    const trn = localStorage.getItem('gst_trn') || localStorage.getItem('trn') || 'GUEST-LEARNING-SESSION';

    // Load data from Supabase on mount
    useEffect(() => {
        const loadTabData = async () => {
            if (!trn || trn === 'GUEST-LEARNING-SESSION') return;

            setIsLoading(true);
            try {
                const response = await api.get(`/forms/tab/${trn}/${tabName}`);
                if (response.data.success && response.data.data) {
                    const savedData = response.data.data;
                    setLoadedData(savedData);

                    // Delay slightly to ensure DOM elements are rendered
                    setTimeout(() => {
                        const inputs = document.querySelectorAll('.bd-page input, .bd-page select, .bd-page textarea');
                        inputs.forEach(input => {
                            let key = input.name || input.id;
                            if (!key && input.dataset.autoKey) key = input.dataset.autoKey;
                            // Re-derive key if still missing (must match saving logic)
                            if (!key) {
                                const label = input.previousElementSibling;
                                if (label && label.tagName === 'LABEL') {
                                    key = label.innerText.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                                } else if (input.placeholder) {
                                    key = 'ph_' + input.placeholder.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                                }
                            }

                            if (key && savedData[key] !== undefined) {
                                // Find standard React setters to bypass React's tracking
                                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                                const nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
                                const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
                                const nativeCheckboxSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'checked')?.set;

                                if (input.type === 'checkbox') {
                                    // Handle array of checkboxes (e.g., activities)
                                    if (Array.isArray(savedData[key])) {
                                        const shouldCheck = savedData[key].includes(input.value);
                                        if (nativeCheckboxSetter) nativeCheckboxSetter.call(input, shouldCheck);
                                        else input.checked = shouldCheck;
                                    } else {
                                        if (nativeCheckboxSetter) nativeCheckboxSetter.call(input, !!savedData[key]);
                                        else input.checked = !!savedData[key];
                                    }
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                } else if (input.type === 'radio') {
                                    const shouldCheck = input.value === savedData[key];
                                    if (nativeCheckboxSetter) nativeCheckboxSetter.call(input, shouldCheck);
                                    else input.checked = shouldCheck;
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                } else {
                                    if (input.tagName === 'SELECT' && nativeSelectValueSetter) {
                                        nativeSelectValueSetter.call(input, savedData[key]);
                                    } else if (input.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
                                        nativeTextAreaValueSetter.call(input, savedData[key]);
                                    } else if (nativeInputValueSetter) {
                                        nativeInputValueSetter.call(input, savedData[key]);
                                    } else {
                                        input.value = savedData[key];
                                    }
                                    // Trigger both input and change for complete React coverage
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                    input.dispatchEvent(new Event('change', { bubbles: true }));
                                }
                            }
                        });
                    }, 500);
                }
            } catch (error) {
                console.error('Failed to load tab data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadTabData();
    }, [tabName, trn]);

    const handleSaveAndContinue = useCallback(async (e, componentData = null) => {
        if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
        }

        // --- GENERIC VALIDATION FOR MANDATORY FIELDS (.red-dot) ---
        let isValid = true;
        let firstErrorMsg = '';

        const redDots = document.querySelectorAll('.bd-page .red-dot');
        for (let dot of redDots) {
            const label = dot.closest('label') || dot.closest('.bd-label') || dot.parentNode;
            if (!label) continue;

            const group = label.closest('.bd-form-group') || label.closest('.form-group') || label.closest('.pp-upload-left') || label.parentElement;
            if (group) {
                // Skip if group is hidden
                const computedStyle = window.getComputedStyle(group);
                if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') continue;

                let rawText = label.innerText || label.textContent;
                let labelText = rawText.replace(/ⓘ/g, '').replace(/\*/g, '').replace('● Indicates mandatory fields', '').trim().split('\n')[0];

                const customSelect = group.querySelector('.bd-cs-value');
                if (customSelect) {
                    if (customSelect.innerText.includes('Select') || customSelect.innerText.trim() === '') {
                        isValid = false;
                        firstErrorMsg = `Please select an option for: ${labelText}`;
                        break;
                    }
                } else {
                    const input = group.querySelector('input:not([type="hidden"]):not([readonly]), select, textarea');
                    if (input) {
                        if (input.type === 'radio' || input.type === 'checkbox') {
                            const checkedGroup = group.querySelectorAll(`input[type="${input.type}"]:checked`);
                            if (checkedGroup.length === 0) {
                                isValid = false;
                                firstErrorMsg = `Please select an option for: ${labelText}`;
                                break;
                            }
                        } else {
                            if (!input.value || !input.value.trim()) {
                                isValid = false;
                                firstErrorMsg = `Please fill mandatory field: ${labelText}`;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!isValid) {
            toast.error(firstErrorMsg);
            return;
        }
        // -------------------------------------------------------------

        setIsSaving(true);
        try {
            // Find all inputs, selects, textareas on the currently active tab
            const inputs = document.querySelectorAll('.bd-page input, .bd-page select, .bd-page textarea');
            const formData = {};

            inputs.forEach(input => {
                // Ignore empty or dummy inputs without names/ids 
                // However, many inputs in this app might not have name props yet.
                // We will collect by placeholder, label text, or unique sequential fallback key.
                let key = input.name || input.id;

                if (!key) {
                    // Try to find a previous sibling label
                    const label = input.previousElementSibling;
                    if (label && label.tagName === 'LABEL') {
                        key = label.innerText.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                    } else if (input.placeholder) {
                        key = 'ph_' + input.placeholder.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                    }
                }

                // Fallback auto generic
                if (!key) {
                    key = 'input_' + Math.random().toString(36).substr(2, 5);
                    input.dataset.autoKey = key; // Keep it consistent if it re-renders
                } else if (input.dataset.autoKey) {
                    key = input.dataset.autoKey;
                }

                if (input.type === 'checkbox') {
                    // Check if multiple checkboxes share the same name (like an array of choices)
                    const sameNameCheckboxes = document.querySelectorAll(`input[type="checkbox"][name="${input.name}"]`);
                    if (sameNameCheckboxes.length > 1) {
                        if (!formData[key]) formData[key] = [];
                        if (input.checked) formData[key].push(input.value);
                    } else {
                        formData[key] = input.checked;
                    }
                } else if (input.type === 'radio') {
                    if (input.checked) formData[key] = input.value;
                } else {
                    formData[key] = input.value;
                }
            });

            // Use component data if provided, else fallback to scraped formData
            const finalData = componentData ? { ...formData, ...componentData } : formData;

            // Send to backend
            const response = await api.post('/forms/save-tab', {
                trn,
                tabName,
                data: finalData
            });

            if (response.data.success) {
                // Track explicitly completed tabs
                const TABS_MAP = {
                    'BusinessDetails': 0, 'PromoterPartners': 1, 'AuthorizedSignatory': 2,
                    'AuthorizedRepresentative': 3, 'PrincipalPlaceOfBusiness': 4,
                    'AdditionalPlacesOfBusiness': 5, 'GoodsAndServices': 6,
                    'StateSpecificInformation': 7, 'AadhaarAuthentication': 8, 'Verification': 9
                };
                const tIndex = TABS_MAP[tabName];
                if (tIndex !== undefined) {
                    let completedTabs = [];
                    try {
                        completedTabs = JSON.parse(localStorage.getItem('gst_completed_tabs') || '[]');
                    } catch (e) { }
                    if (!completedTabs.includes(tIndex)) {
                        completedTabs.push(tIndex);
                        localStorage.setItem('gst_completed_tabs', JSON.stringify(completedTabs));
                    }
                }

                toast.success('Progress saved successfully!');
                if (nextPath) {
                    setTimeout(() => navigate(nextPath), 500);
                }
            } else {
                throw new Error(response.data.message || 'Unknown backend error');
            }
        } catch (error) {
            console.error('Failed to save tab data:', error);
            toast.error('Error saving data: ' + (error.message || 'Check console'));

            // Still allow navigation in learning mode, but with a warning
            if (nextPath) {
                setTimeout(() => navigate(nextPath), 1500);
            }
        } finally {
            setIsSaving(false);
        }
    }, [navigate, nextPath, tabName, trn]);

    return { handleSaveAndContinue, isSaving, isLoading, loadedData };
};
