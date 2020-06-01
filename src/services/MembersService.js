import axios from 'axios';

export class MembersService {

    API_HOST = 'https://api-qs.teamvegan.at';
    API_KEY = 'd31VFwC6AYUHw413iIKzElKGntTT9X';

    getMembers(){

        return axios.get(`${this.API_HOST}/auth/otp`,
            { 
                headers: {
                    'x-api-key': this.API_KEY
                }
            }).then(res => {
                const otp = res.data;

                return axios.get(`${this.API_HOST}/dashboard/members`,
                { 
                    headers: {
                        Authorization: `Bearer ${otp}`
                    }
                }).then(resList => resList.data);

            });
    }

    suspendMember(userId){

        return axios.get(`${this.API_HOST}/auth/otp`,
            { 
                headers: {
                    'x-api-key': this.API_KEY
                }
            }).then(res => {
                const otp = res.data;

                return axios.put(`${this.API_HOST}/discourse/users/suspend?id=${userId}`, null,
                { 
                    headers: {
                        Authorization: `Bearer ${otp}`
                    }
                }).then(resList => resList.data);

            });

    }

    unsuspendMember(userId){

        return axios.get(`${this.API_HOST}/auth/otp`,
            { 
                headers: {
                    'x-api-key': this.API_KEY
                }
            }).then(res => {
                const otp = res.data;

                return axios.put(`${this.API_HOST}/discourse/users/unsuspend?id=${userId}`, null,
                { 
                    headers: {
                        Authorization: `Bearer ${otp}`
                    }
                }).then(resList => resList.data);

            });

    }

}