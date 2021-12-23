import axios from 'axios';
import { CalcUtil } from '../utils/calc.util';

export class MembersService {

    API_HOST = process.env.REACT_APP_API_URL;
    API_KEY = process.env.REACT_APP_API_KEY;

    getMembers(){

        return axios.get(`${this.API_HOST}/auth/otp`,
            { 
                headers: {
                    'x-api-key': this.API_KEY
                }
            }).then(res => {
                const otp = res.data;

                return axios.get(`${this.API_HOST}/dashboard/members?year=${CalcUtil.getCurrentMembershipYear()}`,
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