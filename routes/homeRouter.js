const homeController = require("../controllers/homeController");
const middlewareController = require("../controllers/middlewareController");
const submissionController = require("../controllers/submissionController");
const multer = require('multer');

const router = require("express").Router();

router.get('/', middlewareController.checkLogOutUser, homeController.homePage);
router.get('/loginUser', middlewareController.checkLogOutUser ,homeController.loginUser);
router.post('/loginFunction', homeController.login);
// router.post('/submit',submissionController.uploadItem);
router.get('/pageSubmit/:id',middlewareController.verifyUser, submissionController.submissionSite);
router.get('/homePage', middlewareController.verifyUser, homeController.loginedHome);


router.post('/pageSubmit/:id',middlewareController.verifyUser,submissionController.uploadFile);

module.exports = router;