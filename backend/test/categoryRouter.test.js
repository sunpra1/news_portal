//TODO:    Deletion and updation of category with one or more news
//         Do after news router is completed

import './mongooseSetup';
import Request from './expressSetup.js';

describe("Testing routes on category router", () => {
    let adminToken;
    let categoryId;

    beforeAll(async done => {
        const newUser = {
            fullName: "Dinesh Poudel",
            email: "dinesh.poudel220@gmail.com",
            password: "dinesh12",
            role: "admin"
        };

        const userRegisterRes = await Request.post("/users/register").send(newUser);
        adminToken = userRegisterRes.body.token;

        const newCategory = { category: "Category One" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(newCategory);
        console.log(newCategoryRes.body);
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
        const newCategory = { category: "Category Three" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(newCategory);

        console.log(newCategoryRes.body);
        expect(newCategoryRes.statusCode).toBe(201);
        expect(newCategoryRes.body.category).toBe(newCategory.category);
    });

    test("Should get all categories", async () => {
        const getAllCatRes = await Request.get("/categories");
        expect(getAllCatRes.statusCode).toBe(200);
        expect(getAllCatRes.body.length > 0).toBe(true);
    });

    test("Should not find category with id that doesn't exist while updating", async () => {
        const invalidId = "5f2cfd905a6bda2740a2c234";
        const updatedCategory = { category: "Category Updated" };
        const expectedMessage = "Category with id: " + invalidId + " not found";
        const updateCategoryRes = await Request.put("/categories/" + invalidId)
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
        expect(updateCategoryRes.body.category).toBe(updatedCategory.category);
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
        const expectedMessage = "Provided Id is invalid";
        const deleteCatRes = await Request.delete("/categories/" + invalidId)
            .set("authorization", adminToken);
        expect(deleteCatRes.statusCode).toBe(400);
        expect(deleteCatRes.body.message).toBe(expectedMessage);

    });

    test("Shoud delete category with " + categoryId, async () => {
        const deleteCatRes = await Request.delete("/categories/" + categoryId)
            .set("authorization", adminToken);
        expect(deleteCatRes.statusCode).toBe(200);
        expect(deleteCatRes.body._id).toBe(categoryId);
    });
});