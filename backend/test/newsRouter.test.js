import './mongooseSetup';
import Request from './expressSetup.js';

describe("Testing routes on news router", () => {
    let adminToken;
    let categoryId;
    let anotherCategoryId;
    let newsId;

    beforeAll(async done => {
        const newUser = {
            fullName: "Dinesh Poudel",
            phone: 9847780666,
            password: "dinesh12",
            role: "ADMIN"
        };

        const userRegisterRes = await Request.post("/users/register").send(newUser);
        adminToken = userRegisterRes.body.token;

        const newCategory = { category: "Category Two" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(newCategory);
        categoryId = newCategoryRes.body._id;

        const anotherNewCategory = { category: "Category Three" };
        const anotherNewCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(anotherNewCategory);
        anotherCategoryId = anotherNewCategoryRes.body._id;

        const newNews = {
            title: "Title on sample news one",
            description: "Topic on sample news one",
            category: categoryId
        };

        const addNewsResponse = await Request.post("/news")
            .set("authorization", adminToken)
            .send(newNews);
        newsId = addNewsResponse.body._id;

        done();
    });

    test("Should add new news", async () => {
        const newNews = {
            title: "Title on sample news two",
            description: "Topic on sample news two",
            category: categoryId
        };

        const addNewsResponse = await Request.post("/news")
            .set("authorization", adminToken)
            .send(newNews);

        expect(addNewsResponse.statusCode).toBe(201);
        expect(addNewsResponse.body.title).toBe(newNews.title);
        expect(addNewsResponse.body.description).toBe(newNews.description);
        expect(addNewsResponse.body.category._id).toBe(newNews.category);
    });


    test("Should get news based on provided parameter (i.e. category, search and filter)", async () => {
        const limit = 100;
        const page = 1;
        const category = categoryId;
        const search = "two";
        const filter = "new";

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length == 1).toBe(true);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].title.toLowerCase().indexOf(search) > -1).toBe(true);
    });

    test("Should get news based on provided parameter (i.e. category and search)", async () => {
        const limit = 100;
        const page = 1;
        const category = categoryId;
        const search = "one";
        const filter = "null";

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].category._id).toBe(categoryId);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].title.toLowerCase().indexOf(search) > -1).toBe(true);
    });

    test("Should get news based on provided parameter (i.e. category and filter)", async () => {
        const limit = 100;
        const page = 1;
        const category = categoryId;
        const search = "null";
        const filter = "new";

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].category._id).toBe(categoryId);
    });


    //tested

    test("Should get news based on provided parameter (i.e. search and filter)", async () => {
        const limit = 100;
        const page = 1;
        const category = null;
        const search = "title";
        const filter = "new";

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].title.toLowerCase().indexOf(search) > -1).toBe(true);
        expect(new Date(getNewsResponse.body[getNewsResponse.body.length - 1].createdAt) < new Date(getNewsResponse.body[getNewsResponse.body.length - 2].createdAt)).toBe(true);
    });

    test("Should get news based on provided parameter (i.e. category)", async () => {
        const limit = 100;
        const page = 1;
        const category = categoryId;
        const search = null;
        const filter = null;

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].category._id).toBe(categoryId);
    });

    test("Should get news based on provided parameter (i.e. search)", async () => {
        const limit = 100;
        const page = 1;
        const category = null;
        const search = "title";
        const filter = null;

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
        expect(getNewsResponse.body[getNewsResponse.body.length - 1].title.toLowerCase().indexOf(search) > -1).toBe(true);
    });

    test("Should get news based on provided parameter (i.e. filter)", async () => {
        const limit = 100;
        const page = 1;
        const category = "null";
        const search = "null";
        const filter = "old";

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
        expect(new Date(getNewsResponse.body[getNewsResponse.body.length - 1].createdAt) > new Date(getNewsResponse.body[getNewsResponse.body.length - 2].createdAt)).toBe(true);
    });

    test("Should get news", async () => {
        const limit = 100;
        const page = 1;
        const category = null;
        const search = null;
        const filter = null;

        const getNewsResponse = await Request.get("/news/" + page + "/" + limit + "/" + category + "/" + filter + "/" + search);
        expect(getNewsResponse.statusCode).toBe(200);
        expect(getNewsResponse.body.length > 0).toBe(true);
    });

    test("Should not get news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const getNewsResponse = await Request.get("/news/" + idThatDoesntExist);
        expect(getNewsResponse.statusCode).toBe(400);
        expect(getNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should not get news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Parameter news id, " + invalidID + " is invalid";
        const getNewsResponse = await Request.get("/news/" + invalidID);
        expect(getNewsResponse.statusCode).toBe(400);
        expect(getNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should get news by id", async () => {
        const getNewsResponse = await Request.get("/news/" + newsId);
        expect(getNewsResponse.body._id).toBe(newsId);
    });


    test("Should not update news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const putNewsResponse = await Request.put("/news/" + idThatDoesntExist)
            .set("authorization", adminToken);
        expect(putNewsResponse.statusCode).toBe(400);
        expect(putNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should not update news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Parameter news id, " + invalidID + " is invalid";
        const putNewsResponse = await Request.put("/news/" + invalidID)
            .set("authorization", adminToken);
        expect(putNewsResponse.statusCode).toBe(400);
        expect(putNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should update news with invalid id", async () => {
        const updatedCategory = {
            title: "Updated news title",
            category: anotherCategoryId
        };
        const putNewsResponse = await Request.put("/news/" + newsId)
            .set("authorization", adminToken)
            .send(updatedCategory);
        expect(putNewsResponse.statusCode).toBe(200);
        expect(putNewsResponse.body.title).toBe(updatedCategory.title);
        expect(putNewsResponse.body.category._id).toBe(updatedCategory.category);
        expect(putNewsResponse.body.category.news.includes(categoryId)).toBe(false);
    });


    test("Should not delete news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const deleteNewsResponse = await Request.delete("/news/" + idThatDoesntExist)
            .set("authorization", adminToken);
        expect(deleteNewsResponse.statusCode).toBe(400);
        expect(deleteNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should not delete news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Parameter news id, " + invalidID + " is invalid";
        const deleteNewsResponse = await Request.delete("/news/" + invalidID)
            .set("authorization", adminToken);
        expect(deleteNewsResponse.statusCode).toBe(400);
        expect(deleteNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should delete news with valid id", async () => {
        const deleteNewsResponse = await Request.delete("/news/" + newsId)
            .set("authorization", adminToken);
        expect(deleteNewsResponse.statusCode).toBe(200);
        expect(deleteNewsResponse.body._id).toBe(newsId);
    });

});