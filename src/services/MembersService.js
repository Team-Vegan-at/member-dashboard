import axios from 'axios';

export class MembersService {

    getMembers(){
        return axios.get('resources/data/members.json')
                .then(res => res.data.data);
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