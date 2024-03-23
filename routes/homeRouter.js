const homeController = require("../controllers/homeController");
const middlewareController = require("../controllers/middlewareController");
const submissionController = require("../controllers/submissionController");
const multer = require('multer');

const router = require("express").Router();

router.get('/', homeController.homePage);
router.get('/loginUser', homeController.loginUser);
router.post('/loginFunction', homeController.login);
// router.post('/submit',submissionController.uploadItem);
router.get('/pageSubmit',middlewareController.verifyUser , submissionController.submissionSite);


router.post('/upload',submissionController.uploadFile);

module.exports = router;