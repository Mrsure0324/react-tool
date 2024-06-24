import { request } from '@umijs/max';

export default {
    getReduxValue() {
        return request<any>('/api/v1/redux/value', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}