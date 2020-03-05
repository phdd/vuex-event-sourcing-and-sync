import axios from 'axios';
import qs from 'qs';

const token = process.env.VUE_APP_TODOIST_TOKEN;

const api = axios.create({
    baseURL: 'https://api.todoist.com/sync/v8',
    timeout: 1000,
    headers: {
        'content-type': 'application/x-www-form-urlencoded'
    }
});

export const pull = async (localVersion: string) => {
    return (await api
        .post('/sync', qs.stringify({
            token,
            sync_token: localVersion || '*',
            resource_types: '["items"]'
        }))).data;
};

export const push = async (commands) => {
    return (await api
        .post('/sync', qs.stringify({
            token,
            commands: JSON.stringify(commands)
        }))).data;
};
