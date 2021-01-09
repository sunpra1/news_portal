import Express from 'express';
import Summary from '../Model/Summary.js';

const summaryRouter = Express.Router();
summaryRouter.route("/")
    .get(async (req, res, next) => {
        try {
            const summary = await Summary.findById(1);
            res.send(summary);
        } catch (e) {
            next(e);
        }
    });


summaryRouter.route("/adminAndAuthorUsers")
    .get(async (req, res, next) => {
        try {
            const summary = await Summary.findById(1);
            await summary.populate("adminUsers").populate("authorUsers").execPopulate();
            res.send([...summary.adminUsers, ...summary.authorUsers]);
        } catch (e) {
            next(e);
        }
    });

export default summaryRouter;