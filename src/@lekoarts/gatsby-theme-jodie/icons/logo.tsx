import React from "react";
import logoImage from "./pictozeal-logo.jpg";

const Logo = () => (
  <div>
  <img
    src={logoImage}
    alt="PictoZeal"
    width={150}
    height={150}
  />
  {/* <a href="https://www.instagram.com/pictozeal/">
  <img width="48" height="48" src="https://img.icons8.com/color/48/instagram-new--v1.png" alt="instagram-new--v1"/>
  </a> */}
  </div>
);

export default Logo;