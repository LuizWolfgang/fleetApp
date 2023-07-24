import axios, { AxiosError } from 'axios';


const api = axios.create({
  baseURL: 'http://192.168.2.1:3001'
})


export { api };