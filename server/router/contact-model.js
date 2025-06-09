const express = require("express");
const router = express.Router();
const contactForm = require("../controllers/contact-controllers");






router.route("/contact").post(contactForm);
module.exports = router;



// 1.first  asa ba karsakta ho ba 
// router.get("/", (req, res) => {
//     res.status(200).send("wolcom to  using router");
// });

// 2-- is ma tum .get .post .delet ak sat lak saktaho
// router.route("/").get( (req, res) => {
//     res.status(200).send("wolcom to  using router");
// });