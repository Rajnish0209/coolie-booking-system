import axios from 'axios';

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    console.log('Axios x-auth-token header SET with:', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    console.log('Axios x-auth-token header REMOVED');
  }
};

export default setAuthToken;
