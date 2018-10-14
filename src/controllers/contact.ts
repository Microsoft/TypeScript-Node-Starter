import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { route } from "../core/route";
import { HttpMethod } from "../core/http";

export class ContactController {
  private transporter = nodemailer.createTransport({
    service: "SendGrid",
    auth: {
      user: process.env.SENDGRID_USER,
      pass: process.env.SENDGRID_PASSWORD
    }
  });

  /**
   * GET /contact
   * Contact form page.
   */
  @route(HttpMethod.GET, "/contact")
  get = async (req: Request, res: Response) => {
    res.render("contact", {
      title: "Contact"
    });
  }

  /**
   * POST /contact
   * Send a contact form via Nodemailer.
   */
  @route(HttpMethod.POST, "/contact")
  postContact = async(req: Request, res: Response) => {
    req.assert("name", "Name cannot be blank").notEmpty();
    req.assert("email", "Email is not valid").isEmail();
    req.assert("message", "Message cannot be blank").notEmpty();

    const errors = req.validationErrors();

    if (errors) {
      req.flash("errors", errors);
      return res.redirect("/contact");
    }

    const mailOptions = {
      to: "your@email.com",
      from: `${req.body.name} <${req.body.email}>`,
      subject: "Contact Form",
      text: req.body.message
    };

    this.transporter.sendMail(mailOptions, (err) => {
      if (err) {
        req.flash("errors", { msg: err.message });
        return res.redirect("/contact");
      }
      req.flash("success", { msg: "Email has been sent successfully!" });
      res.redirect("/contact");
    });
  }
}


