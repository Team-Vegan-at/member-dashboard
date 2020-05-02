import axios from 'axios';

export class MembersService {

    getMembers(){

        return axios.get('https://api.teamvegan.at/auth/otp',
            { 
                headers: {
                    'x-api-key': 'Tcdz88F8vKsezgpmS0W0PbziYotHxr'
                }
            }).then(res => {
                const otp = res.data;

                return axios.get('https://api.teamvegan.at/dashboard/members',
                { 
                    headers: {
                        Authorization: `Bearer ${otp}`
                    }
                }).then(resList => resList.data);

            });

        

        // return axios.get('resources/data/members.json')
        //         .then(res => res.data.data);
    }

    getCarsSmall() {
        return axios.get('resources/data/cars.json')
                .then(res => res.data.data);
    }

    getCarsMedium() {
        return axios.get('resources/data/cars.json')
                .then(res => res.data.data);
    }

    getCarsLarge() {
        return axios.get('resources/data/cars.json')
                .then(res => res.data.data);
    }
}