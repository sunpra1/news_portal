import './mongooseSetup';
import Request from './expressSetup.js';

describe("Testing routes on category router", () => {
    let adminToken;
    let categoryId;

    beforeAll(async done => {
        const newUser = {
            fullName: "Dinesh Poudel",
            phone: 9847780665,
            password: "dinesh12",
            role: "ADMIN"
        };
        const userRegisterRes = await Request.post("/users/register").send(newUser);
        adminToken = userRegisterRes.body.token;

        const newCategory = { category: "Category One" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(newCategory);
        categoryId = newCategoryRes.body._id;

        done();
    });

    test("Should fail to add empty category", async () => {
        const expectedMessage = "Category is required";
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken);

        expect(newCategoryRes.statusCode).toBe(400);
        expect(newCategoryRes.body.message.category).toBe(expectedMessage);
    });

    test("Should add new category", async () => {
        const newCategory = { category: "Unique Category" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(newCategory);

        expect(newCategoryRes.statusCode).toBe(201);
        expect(newCategoryRes.body.category).toBe(newCategory.category.toUpperCase());
    });

    test("Should get all categories", async () => {
        const getAllCatRes = await Request.get("/categories");
        expect(getAllCatRes.statusCode).toBe(200);
        expect(getAllCatRes.body.length > 0).toBe(true);
    });

    test("Should not find category with invalid id while updating", async () => {
        const invalidId = "Invalid id";
        const updatedCategory = { category: "Category Updated" };
        const expectedMessage = "Provide valid id for route parameter categoryID";
        const updateCategoryRes = await Request.put("/categories/" + invalidId)
            .send(updatedCategory)
            .set("authorization", adminToken);

        expect(updateCategoryRes.statusCode).toBe(400);
        expect(updateCategoryRes.body.message.categoryID).toBe(expectedMessage);
    });

    test("Should not find category with id that doesn't exist while updating", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const updatedCategory = { category: "Category Updated" };
        const expectedMessage = "Category with id: " + idThatDoesntExist + " not found";
        const updateCategoryRes = await Request.put("/categories/" + idThatDoesntExist)
            .send(updatedCategory)
            .set("authorization", adminToken);

        expect(updateCategoryRes.statusCode).toBe(400);
        expect(updateCategoryRes.body.message).toBe(expectedMessage);
    });

    test("Shoud not update category with empty value for category", async () => {
        const updatedCategory = { category: "" };
        const expectedMessage = "Category is required";
        const updateCategoryRes = await Request.put("/categories/" + categoryId)
            .set("authorization", adminToken)
            .send(updatedCategory);
        expect(updateCategoryRes.statusCode).toBe(400);
        expect(updateCategoryRes.body.message.category).toBe(expectedMessage);
    });

    test("Shoud update category", async () => {
        const updatedCategory = { category: "Updated Category" };
        const updateCategoryRes = await Request.put("/categories/" + categoryId)
            .set("authorization", adminToken)
            .send(updatedCategory);
        expect(updateCategoryRes.statusCode).toBe(200);
        expect(updateCategoryRes.body._id).toBe(categoryId);
        expect(updateCategoryRes.body.category).toBe(updatedCategory.category.toUpperCase());
    });

    test("Should not find category with id that doesn't exist while deleting", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "Category with id: " + idThatDoesntExist + " not found";
        const deleteCatRes = await Request.delete("/categories/" + idThatDoesntExist)
            .set("authorization", adminToken);

        expect(deleteCatRes.statusCode).toBe(400);
        expect(deleteCatRes.body.message).toBe(expectedMessage);

    });

    test("Should not find category with invalid id while deleting", async () => {
        const invalidId = "Invalid id";
        const expectedMessage = "Provide valid id for route parameter categoryID";
        const deleteCatRes = await Request.delete("/categories/" + invalidId)
            .set("authorization", adminToken);
        expect(deleteCatRes.statusCode).toBe(400);
        expect(deleteCatRes.body.message.categoryID).toBe(expectedMessage);
    });

    test("Shoud delete category with " + categoryId, async () => {
        const deleteCatRes = await Request.delete("/categories/" + categoryId)
            .set("authorization", adminToken);
        expect(deleteCatRes.statusCode).toBe(200);
        expect(deleteCatRes.body._id).toBe(categoryId);
    });

    /*--TESTED ON 2021/01/13--*/

    test("Should probihit to add category to other user expect admin", async () => {
        const userTwo = {
            fullName: "User Two",
            phone: 9810000000,
            password: "usertwo12",
            role: "AUTHOR"
        };

        const userRegisterRes = await Request.post("/users/register").send(userTwo);
        const userTwoToken = userRegisterRes.body.token;

        const categoryThree = { category: "Category Three" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", userTwoToken)
            .send(categoryThree);

        console.log(newCategoryRes.body);
        expect(newCategoryRes.statusCode).toBe(401);
        expect(newCategoryRes.body.message).not.toBe(undefined);
    });

    test("Should probihit to delete category with one or more news", async () => {
        const categoryThree = { category: "Category Three" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(categoryThree);
        console.log(newCategoryRes.body);
        expect(newCategoryRes.statusCode).toBe(400);
        expect(newCategoryRes.body.message).not.toBe(undefined);
    });

});