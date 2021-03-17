import './mongooseSetup';
import Request from './expressSetup.js';

describe("Testing routes on news router", () => {
    let adminToken;
    let categoryId;
    let anotherCategoryId;
    let newsId;
    let commentId;

    beforeAll(async done => {
        const newUser = {
            fullName: "Dinesh Poudel",
            phone: 9847780666,
            password: "dinesh12",
            role: "ADMIN"
        };

        const userRegisterRes = await Request.post("/users/register").send(newUser);
        adminToken = userRegisterRes.body.token;

        const newCategory = { category: "Category four" };
        const newCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(newCategory);
        categoryId = newCategoryRes.body._id;

        const anotherNewCategory = { category: "Category five" };
        const anotherNewCategoryRes = await Request.post("/categories")
            .set("authorization", adminToken)
            .send(anotherNewCategory);
        anotherCategoryId = anotherNewCategoryRes.body._id;

        const newsOne = {
            title: "Title on sample news one",
            description: "Topic on sample news one",
            category: categoryId
        };

        const addNewsResponse = await Request.post("/news")
            .set("authorization", adminToken)
            .send(newsOne);
        newsId = addNewsResponse.body._id;

        done();
    });

    test("Should add new news", async () => {
        const newsTwo = {
            title: "Title on sample news two",
            description: "Topic on sample news two",
            category: categoryId
        };

        const addNewsResponse = await Request.post("/news")
            .set("authorization", adminToken)
            .send(newsTwo);

        expect(addNewsResponse.statusCode).toBe(201);
        expect(addNewsResponse.body.title).toBe(newsTwo.title);
        expect(addNewsResponse.body.description).toBe(newsTwo.description);
        expect(addNewsResponse.body.category._id).toBe(newsTwo.category);
    });


    test("Should get news based on provided parameter (i.e. category, search and filter)", async () => {
        const limit = 100;
        const page = 1;
        const category = categoryId;
        const search = "two";
        const filter = "new";

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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

        const getNewsResponse = await Request.get("/news/backend/" + page + "/" + limit + "/false/" + category + "/" + filter + "/" + search).set("authorization", adminToken);
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
        const expectedMessage = "Provide valid id for route parameter newsID";
        const putNewsResponse = await Request.put("/news/" + invalidID)
            .set("authorization", adminToken);
        expect(putNewsResponse.statusCode).toBe(400);
        expect(putNewsResponse.body.message.newsID).toBe(expectedMessage);
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
        const expectedMessage = "Provide valid id for route parameter newsID";
        const deleteNewsResponse = await Request.delete("/news/" + invalidID)
            .set("authorization", adminToken);
        expect(deleteNewsResponse.statusCode).toBe(400);
        expect(deleteNewsResponse.body.message.newsID).toBe(expectedMessage);
    });

    test("Should not post comment on news with id that doesn't exist", async () => {
        const newComment = {
            comment: "Sample comment on news"
        };
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const postCommentResponse = await Request.post("/news/" + idThatDoesntExist + "/comments")
            .set("authorization", adminToken)
            .send(newComment);

        expect(postCommentResponse.statusCode).toBe(400);
        expect(postCommentResponse.body.message).toBe(expectedMessage);
    });

    test("Should not post comment on news with invalid id", async () => {
        const newComment = {
            comment: "Sample comment on news"
        };
        const invalidID = "Invalid ID";
        const expectedMessage = "Provide valid id for route parameter newsID";
        const postCommentResponse = await Request.post("/news/" + invalidID + "/comments")
            .set("authorization", adminToken)
            .send(newComment);
        expect(postCommentResponse.statusCode).toBe(400);
        expect(postCommentResponse.body.message.newsID).toBe(expectedMessage);
    });

    test("Should post comment on news", async () => {
        const newComment = {
            comment: "Sample comment on news"
        };

        const postCommentResponse = await Request.post("/news/" + newsId + "/comments")
            .set("authorization", adminToken)
            .send(newComment);
        commentId = postCommentResponse.body._id;

        expect(postCommentResponse.statusCode).toBe(201);
        expect(postCommentResponse.body.comment).toBe(newComment.comment);
    });

    test("Should not update comment on news with id that doesn't exist", async () => {
        const newComment = {
            comment: "Sample comment on news updated"
        };
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "Comment with id: " + idThatDoesntExist + " not found";
        const updateCommentResponse = await Request.put("/news/" + newsId + "/comments/" + idThatDoesntExist)
            .set("authorization", adminToken)
            .send(newComment);

        expect(updateCommentResponse.statusCode).toBe(400);
        expect(updateCommentResponse.body.message).toBe(expectedMessage);
    });

    test("Should not update comment on news with invalid id", async () => {
        const newComment = {
            comment: "Sample comment on news updated"
        };
        const invalidID = "Invalid ID";
        const expectedMessage = "Provide valid id for route parameter commentID";
        const updateCommentResponse = await Request.put("/news/" + newsId + "/comments/" + invalidID)
            .set("authorization", adminToken)
            .send(newComment);
        expect(updateCommentResponse.statusCode).toBe(400);
        expect(updateCommentResponse.body.message.commentID).toBe(expectedMessage);
    });

    test("Should update comment on news", async () => {
        const newComment = {
            comment: "Sample comment on news updated"
        };
        const updateCommentResponse = await Request.put("/news/" + newsId + "/comments/" + commentId)
            .set("authorization", adminToken)
            .send(newComment);

        expect(updateCommentResponse.statusCode).toBe(200);
        expect(updateCommentResponse.body.comment).toBe(newComment.comment);
    });


    test("Should not delete comment on news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "Comment with id: " + idThatDoesntExist + " not found";
        const deleteCommentResponse = await Request.delete("/news/" + newsId + "/comments/" + idThatDoesntExist)
            .set("authorization", adminToken);

        expect(deleteCommentResponse.statusCode).toBe(400);
        expect(deleteCommentResponse.body.message).toBe(expectedMessage);
    });

    test("Should not delete comment on news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Provide valid id for route parameter commentID";
        const deleteCommentResponse = await Request.delete("/news/" + newsId + "/comments/" + invalidID)
            .set("authorization", adminToken);
        expect(deleteCommentResponse.statusCode).toBe(400);
        expect(deleteCommentResponse.body.message.commentID).toBe(expectedMessage);
    });

    test("Should not increase view of news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const increaseNewsViewRes = await Request.put("/news/" + idThatDoesntExist + "/increaseViews");

        expect(increaseNewsViewRes.statusCode).toBe(400);
        expect(increaseNewsViewRes.body.message).toBe(expectedMessage);
    });

    test("Should not increase view of news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Provide valid id for route parameter newsID";
        const increaseNewsViewRes = await Request.put("/news/" + invalidID + "/increaseViews");

        expect(increaseNewsViewRes.statusCode).toBe(400);
        expect(increaseNewsViewRes.body.message.newsID).toBe(expectedMessage);
    });

    test("Should increase view of news", async () => {
        const newsDetailsBeforeIncreasingViewCount = await Request.get("/news/" + newsId);
        const increaseNewsViewRes = await Request.put("/news/" + newsId + "/increaseViews");
        expect(increaseNewsViewRes.statusCode).toBe(200);
        expect(Number(increaseNewsViewRes.body.views)).toBe(Number(newsDetailsBeforeIncreasingViewCount.body.views) + 1);
    });

    test("Should not react on news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234"; const newReact = {
            type: "SAD"
        };
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const reactNewsResponse = await Request.post("/news/" + idThatDoesntExist + "/reacts")
            .set("authorization", adminToken)
            .send(newReact);

        expect(reactNewsResponse.statusCode).toBe(400);
        expect(reactNewsResponse.body.message).toBe(expectedMessage);
    });

    test("Should not react on view of news with invalid id", async () => {
        const invalidID = "Invalid ID"; const newReact = {
            type: "SAD"
        };
        const expectedMessage = "Provide valid id for route parameter newsID";
        const reactNewsResponse = await Request.post("/news/" + invalidID + "/reacts")
            .set("authorization", adminToken)
            .send(newReact);

        expect(reactNewsResponse.statusCode).toBe(400);
        expect(reactNewsResponse.body.message.newsID).toBe(expectedMessage);
    });

    test("Should add react on news", async () => {
        const newReact = {
            type: "SAD"
        };
        const reactNewsResponse = await Request.post("/news/" + newsId + "/reacts")
            .set("authorization", adminToken)
            .send(newReact);
        expect(reactNewsResponse.statusCode).toBe(200);
        expect(reactNewsResponse.body.type).toBe(newReact.type);
    });

    test("Should not react on comment with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "Comment with id: " + idThatDoesntExist + " not found";
        const commentReactResponse = await Request.post("/news/" + newsId + "/comments/" + idThatDoesntExist + "/reacts")
            .set("authorization", adminToken);

        expect(commentReactResponse.statusCode).toBe(400);
        expect(commentReactResponse.body.message).toBe(expectedMessage);
    });

    test("Should not react on comment of news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Provide valid id for route parameter commentID";
        const commentReactResponse = await Request.post("/news/" + newsId + "/comments/" + invalidID + "/reacts")
            .set("authorization", adminToken);

        expect(commentReactResponse.statusCode).toBe(400);
        expect(commentReactResponse.body.message.commentID).toBe(expectedMessage);
    });

    test("Should add react on comment", async () => {
        const newReact = {
            type: "LIKE"
        };
        const reactCommentResponse = await Request.post("/news/" + newsId + "/comments/" + commentId + "/reacts")
            .set("authorization", adminToken)
            .send(newReact);

        expect(reactCommentResponse.statusCode).toBe(200);
        expect(reactCommentResponse.body.type).toBe(newReact.type);
    });

    /*--TESTED ON 2021/01/13--*/
    test("Should not increase share count of news with id that doesn't exist", async () => {
        const idThatDoesntExist = "5f2cfd905a6bda2740a2c234";
        const expectedMessage = "News with id: " + idThatDoesntExist + " not found";
        const increaseNewsSharesCountRes = await Request.put("/news/" + idThatDoesntExist + "/increaseShares");

        expect(increaseNewsSharesCountRes.statusCode).toBe(400);
        expect(increaseNewsSharesCountRes.body.message).toBe(expectedMessage);
    });

    test("Should not increase share count of news with invalid id", async () => {
        const invalidID = "Invalid ID";
        const expectedMessage = "Provide valid id for route parameter newsID";
        const increaseNewsSharesCountRes = await Request.put("/news/" + invalidID + "/increaseShares");

        expect(increaseNewsSharesCountRes.statusCode).toBe(400);
        expect(increaseNewsSharesCountRes.body.message.newsID).toBe(expectedMessage);
    });

    test("Should increase share count of news", async () => {
        const newsDetailsBeforeIncreasingShareCount = await Request.get("/news/" + newsId);
        const increaseNewsSharesCountRes = await Request.put("/news/" + newsId + "/increaseShares");
        expect(increaseNewsSharesCountRes.statusCode).toBe(200);
        expect(Number(increaseNewsSharesCountRes.body.shares)).toBe(Number(newsDetailsBeforeIncreasingShareCount.body.shares) + 1);
    });

    test("Should not get popular news with invalid params", async () => {
        const invalidPeriodParam = "Invalid Period";
        const invalidIsCategoryWiseParam = "Invalid IS CATEGORY WISE";
        const invalidThresholdParam = "Invalid Threshold";
        const getPopularNewsResponse = await Request.get("/news/popular/" + invalidPeriodParam + "/" + invalidIsCategoryWiseParam + "/" + invalidThresholdParam);
        expect(getPopularNewsResponse.statusCode).toBe(400);
        expect(Object.keys(getPopularNewsResponse.body.message).includes("period"));
        expect(Object.keys(getPopularNewsResponse.body.message).includes("isCategoryWise"));
        expect(Object.keys(getPopularNewsResponse.body.message).includes("threshold"));
    });

    test("Should get popular news with invalid params", async () => {
        const periodParam = "this_week";
        const isCategoryWiseParam = "false";
        const thresholdParam = "0";
        const getPopularNewsResponse = await Request.get("/news/popular/" + periodParam + "/" + isCategoryWiseParam + "/" + thresholdParam);
        expect(getPopularNewsResponse.statusCode).toBe(200);
        expect(getPopularNewsResponse.body.length > 0).toBe(true);
    });

    test("Should get search suggestion of news added by all", async () => {
        const searchTerm = "sample";
        const getSearchSuggestionsOnAllNews = await Request.get("/news/search_suggestions/" + searchTerm + "/10");
        expect(getSearchSuggestionsOnAllNews.statusCode).toBe(200);
        expect(getSearchSuggestionsOnAllNews.body.length > 0).toBe(true);
        expect(getSearchSuggestionsOnAllNews.body[0].title.indexOf(searchTerm) >= 0).toBe(true);
    });

    test("Shoud get search suggestions of news added by me", async () => {
        const user = {
            fullName: "Admin User",
            phone: 9800000000,
            password: "user12",
            role: "ADMIN"
        };
        const userRegisterRes = await Request.post("/users/register").send(user);
        const userToken = userRegisterRes.body.token;
        const newsThree = {
            title: "Title on sample news three",
            description: "Topic on sample news three",
            category: categoryId
        };
        await Request.post("/news")
            .set("authorization", userToken)
            .send(newsThree);

        const searchTerm = "sample";
        const getSearchSuggestionsOnMyNews = await Request.get("/news/my/search_suggestions/" + searchTerm + "/10")
            .set("authorization", userToken);
        expect(getSearchSuggestionsOnMyNews.statusCode).toBe(200);
        expect(getSearchSuggestionsOnMyNews.body.length == 1).toBe(true);
        expect(getSearchSuggestionsOnMyNews.body[0].title.indexOf(searchTerm) >= 0).toBe(true);
    });

    /*---Should remain at last--*/
    test("Should delete comment on news", async () => {
        const deleteCommentResponse = await Request.delete("/news/" + newsId + "/comments/" + commentId)
            .set("authorization", adminToken);

        expect(deleteCommentResponse.statusCode).toBe(200);
    });

    test("Should delete news with valid id", async () => {
        const deleteNewsResponse = await Request.delete("/news/" + newsId)
            .set("authorization", adminToken);
        expect(deleteNewsResponse.statusCode).toBe(200);
        expect(deleteNewsResponse.body._id).toBe(newsId);
    });
});