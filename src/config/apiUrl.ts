import { environment } from '../environments/environment';
const API_URL = environment.baseUrl;

export const apiUrl = {
    pdfView: API_URL + 'server/api/usermanual',
    draftBaseUrl: API_URL + 'server/api'
}