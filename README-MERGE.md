# DBIZ Combined CRM + GST Application

- CRM frontend: `/`
- GST frontend: `/gst`
- CRM APIs: `/api/*`
- GST APIs: `/api/gst/*`

The single Vite entry chooses the CRM application for normal URLs and the GST application for `/gst/*`. The GST router uses `basename="/gst"`, preserving its original route definitions.

CRM authentication continues to use localStorage key `token`.
GST authentication uses localStorage key `gst_token`.
The GST RegistrationCreditWidget intentionally reads CRM key `token` and calls `/api/student/credits`.

## Local setup

1. Copy `.env.example` to `.env` and provide both projects' environment values.
2. Run `npm install`.
3. Run `npm run setup`.
4. Run `npm run build`.
5. Run `npm start`.
