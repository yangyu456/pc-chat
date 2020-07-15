import React, { Component } from "react";
import { Link } from "react-router-dom";
import clazz from "classname";

import classes from "./style.css";
import Home from "./Home";
import Contacts from "./Contacts";
import Settings from "./Settings";
import Personal from "./Personal";

export default class Footer extends Component {
    render() {
        var pathname = this.props.location.pathname;
        var component = {
            "/": Home,
            "/contacts": Contacts,
            "/settings": Settings,
            "/personal": Personal,
        }[pathname];

        return (
            <footer className={classes.footer}>
                <div className={classes.right}>
                    {React.createElement(component)}
                </div>
            </footer>
        );
    }
}
