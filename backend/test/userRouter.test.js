import './mongooseSetup.js';
import Request from './expressSetup.js';

describe("Testing routes on user router", () => {
    let adminToken;

    test("Should register new user", async () => {
        const newUser = {
            fullName: "Sunil Prasai",
            phone: 9849147995,
            password: "sunpra12",
            role: "ADMIN"
        };
        const registerNewUserRes = await Request.post("/users/register")
            .send(newUser);
        adminToken = registerNewUserRes.body.token;

        expect(registerNewUserRes.statusCode).toBe(201);
        expect(registerNewUserRes.body.user.name).toBe(newUser.name);
        expect(registerNewUserRes.body.user.email).toBe(newUser.email);
        expect(registerNewUserRes.body.token === undefined).not.toBe(true);

    });

    test("Should check whether phone number is already taken during registration", async () => {
        const requestBody = { phone: "9849147995" };
        const validationRes = await Request.post("/users/validate-unique-user")
            .send(requestBody);
        expect(validationRes.statusCode).toBe(200);
        expect(validationRes.body.isUnique).toBe(false);
    });

    test("Should login registered user", async () => {
        const user = {
            phone: 9849147995,
            password: "sunpra12"
        };
        const registerNewUserRes = await Request.post("/users/login")
            .send(user);

        expect(registerNewUserRes.statusCode).toBe(200);
        expect(registerNewUserRes.body.user.phone).toBe(user.phone);
        expect(registerNewUserRes.body.token === undefined).not.toBe(true);

    });

    test("Should get user profile", async () => {
        const getProfileRes = await Request.get("/users/profile")
            .set("authorization", adminToken);
        expect(getProfileRes.statusCode).toBe(200);
    });

    test("Should update user profile", async () => {
        const updatedUserDetails = {
            fullName: "Kamal Prasai",
            phone: 9861181264,
            address: "Chunikhel, BUD-13, KTM, Nepal",
            gender: "MALE",
            dob: "1993-11-24"
        };
        const updateUserRes = await Request.put("/users/profile")
            .set("authorization", adminToken)
            .send(updatedUserDetails);
        expect(200).toBe(updateUserRes.statusCode);
        expect(updateUserRes.body.name).toBe(updatedUserDetails.name);
        expect(updateUserRes.body.address).toBe(updatedUserDetails.address);
        expect(updateUserRes.body.gender).toBe(updatedUserDetails.gender);
        expect(updateUserRes.body.dob.substr(0, 10)).toBe(updatedUserDetails.dob);
    });

    test("Should update user role", async () => {
        const newUser = {
            fullName: "Sunil Prasai",
            phone: 9830000000,
            password: "sunpra12",
            role: "USER"
        };

        const registerNewUserRes = await Request.post("/users/register").send(newUser);
        const userID = registerNewUserRes.body.user._id;


        const updatedUserDetails = {
            id: userID,
            role: "AUTHOR"
        };
        const updateUserRes = await Request.put("/users/update-role")
            .set("authorization", adminToken)
            .send(updatedUserDetails);
        expect(200).toBe(updateUserRes.statusCode);
        expect(updateUserRes.body.role).toBe(updatedUserDetails.role);
    });

    test("Should logout user", async () => {
        const expectedResponse = { message: "You logged out successfully" };
        const logoutRes = await Request.post("/users/logout")
            .set("authorization", adminToken);
        expect(logoutRes.statusCode).toBe(200);
        expect(logoutRes.body).toStrictEqual(expectedResponse);
    });

    test("Should logout user from all devices", async () => {
        const newUser = {
            fullName: "Sunil Prasai",
            phone: 9820000000,
            password: "sunpra12",
            role: "ADMIN"
        };

        const registerNewUserRes = await Request.post("/users/register").send(newUser);
        const token = registerNewUserRes.body.token;


        const expectedResponse = { message: "You logged out successfully" };
        const logoutRes = await Request.post("/users/logoutAll")
            .set("authorization", token);
        expect(logoutRes.statusCode).toBe(200);
        expect(logoutRes.body).toStrictEqual(expectedResponse);
    });
});