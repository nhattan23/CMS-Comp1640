const homeController = require("../controllers/homeController");
const middlewareController = require("../controllers/middlewareController");

const router = require("express").Router();

router.get('/', homeController.homePage);

module.exports = router;