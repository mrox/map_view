import axios from "axios";
const USERNAME = 'username'
const PASSWORD = 'password';
class API {
    constructor() {
        this.baseURL = '//uat-api-web-mba.vinhomes.vn'
        this.username = localStorage.getItem(USERNAME);
        this.password = localStorage.getItem(PASSWORD)
        this.axios = axios.create({
            baseURL: '//uat-api-web-mba.vinhomes.vn'
            // baseURL: '//localhost:5000'
        })
    }
    isLoggedIn() {
        return !!this.username && !!this.password
    }
    logOut(){
        localStorage.removeItem(USERNAME)
        localStorage.removeItem(PASSWORD)
        localStorage.removeItem('token')
    }
    async login(username, password) {

        let data = {
            "GoogleCaptchaResponse": "03AGdBq25SMJO3qshF1RM2M_4OfJ3pMfWqsFlicmbOI2h6TzUg1yr3yBnQ0z_agzDmHxzM3a6eGj-8XsYaPrhC1fIJbvXcK69dvUw5dCiNPk9KnShi2CQf-SrFAgC4oaw-tWh5Ps0eYT63XXU9xrj5zN9ZfP0SHEZKQXhIsIxdhTv2IWs61WaTgm2u21rKxC191KfGu2hCM0q1mzjEYObNj-lq1LsJ3D-mwtZN0nFYolVoGuqrqmCWpbXnSzkaeiU5QQ9sIwt8ISLGIOYtUZjK-x5yIMsSQd2ZRoWKWKK8Gi7M09Y6cbcfoc38jS2kPOxu6ezj3a8Yzbqw2RJZ1iRE-FVCEM4iD0K20VD40HuiXk6Cyvmh8HxKSaMKNgTwpE7EMseLiFwRrQ2ASncnDHmbN1Lt1gWJqIdOTP2cuZd6c6eG-g-7AQXq27vnNPRm4lGJ9PCH5wywLGNR",
            "Password": this.password ? this.password : password,
            "UserName": this.username ? this.username : username,
            "timezoneOffset": -420
        }
        let login_url = `/users/login`;
        try {
            let res = await this.axios.post(login_url, data)
            this.axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`
            localStorage.setItem('token', res.data.accessToken)
            
            return res.data.accessToken
        } catch (error) {
            throw error
        }
    }
    async getLocations() {
        await this.login();

        let url = `/api/location`
        try {
            let res = await this.axios.get(url)
            // console.log(res.data);
            return res.data
        } catch (error) {
            alert(error.message)
        }
    }
    async updateLocation(id, v) {
        console.log(id, v);
        let url = '/api/location'
        try {
            let data = {
                id,
                name: v.name,
                polygon: JSON.stringify(v.points)
            }
            let rs = await this.axios.put(url, data)
        } catch (error) {
            console.log(error);
        }
    }
    async createLocation(v) {
        console.log(v);
        let url = '/api/location'
        try {
            let data = {
                name: v.name,
                polygon: JSON.stringify(v.points)
            }
            let rs = await this.axios.post(url, data)
        } catch (error) {
            console.log(error);
        }
    }
}

// function API()
// {
//     const login = (username, password) => {
//         localStorage.setItem('token','abc')
//     }
//     return null;
// }
// 
export default new API();