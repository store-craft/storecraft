import { base64 } from '../crypto/public.js';

/**
 * @description `base64` encoding the templates test helps with drivers
 * such as `D1`, that do not support parameter binding over HTTP
 * @param {string} val 
 */
const base64_encode = val => {
  return 'base64_' + base64.encode(val);
}


export const templates = [
  {
    "title": "Order Cancelled",
    "template_html": base64_encode("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns=\"http://www.w3.org/1999/xhtml\" style=\"color-scheme: light dark; supported-color-schemes: light dark;\">\n  <head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"x-apple-disable-message-reformatting\" />\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n    <meta name=\"color-scheme\" content=\"light dark\" />\n    <meta name=\"supported-color-schemes\" content=\"light dark\" />\n    <title></title>\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    /* Base ------------------------------ */\n    \n    @import url(\"https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap\");\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    a {\n      color: #3869D4;\n    }\n    \n    a img {\n      border: none;\n    }\n    \n    td {\n      word-break: break-word;\n    }\n    \n    .preheader {\n      display: none !important;\n      visibility: hidden;\n      mso-hide: all;\n      font-size: 1px;\n      line-height: 1px;\n      max-height: 0;\n      max-width: 0;\n      opacity: 0;\n      overflow: hidden;\n    }\n    /* Type ------------------------------ */\n    \n    body,\n    td,\n    th {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    h1 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 22px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h2 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 16px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h3 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 14px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    td,\n    th {\n      font-size: 16px;\n    }\n    \n    p,\n    ul,\n    ol,\n    blockquote {\n      margin: .4em 0 1.1875em;\n      font-size: 16px;\n      line-height: 1.625;\n    }\n    \n    p.sub {\n      font-size: 13px;\n    }\n    /* Utilities ------------------------------ */\n    \n    .align-right {\n      text-align: right;\n    }\n    \n    .align-left {\n      text-align: left;\n    }\n    \n    .align-center {\n      text-align: center;\n    }\n    \n    .u-margin-bottom-none {\n      margin-bottom: 0;\n    }\n    /* Buttons ------------------------------ */\n    \n    .button {\n      background-color: #3869D4;\n      border-top: 10px solid #3869D4;\n      border-right: 18px solid #3869D4;\n      border-bottom: 10px solid #3869D4;\n      border-left: 18px solid #3869D4;\n      display: inline-block;\n      color: #FFF;\n      text-decoration: none;\n      border-radius: 3px;\n      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);\n      -webkit-text-size-adjust: none;\n      box-sizing: border-box;\n    }\n    \n    .button--green {\n      background-color: #22BC66;\n      border-top: 10px solid #22BC66;\n      border-right: 18px solid #22BC66;\n      border-bottom: 10px solid #22BC66;\n      border-left: 18px solid #22BC66;\n    }\n    \n    .button--red {\n      background-color: #FF6136;\n      border-top: 10px solid #FF6136;\n      border-right: 18px solid #FF6136;\n      border-bottom: 10px solid #FF6136;\n      border-left: 18px solid #FF6136;\n    }\n    \n    @media only screen and (max-width: 500px) {\n      .button {\n        width: 100% !important;\n        text-align: center !important;\n      }\n    }\n    /* Attribute list ------------------------------ */\n    \n    .attributes {\n      margin: 0 0 21px;\n    }\n    \n    .attributes_content {\n      background-color: #F4F4F7;\n      padding: 16px;\n    }\n    \n    .attributes_item {\n      padding: 0;\n    }\n    /* Related Items ------------------------------ */\n    \n    .related {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .related_item {\n      padding: 10px 0;\n      color: #CBCCCF;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .related_item-title {\n      display: block;\n      margin: .5em 0 0;\n    }\n    \n    .related_item-thumb {\n      display: block;\n      padding-bottom: 10px;\n    }\n    \n    .related_heading {\n      border-top: 1px solid #CBCCCF;\n      text-align: center;\n      padding: 25px 0 10px;\n    }\n    /* Discount Code ------------------------------ */\n    \n    .discount {\n      width: 100%;\n      margin: 0;\n      padding: 24px;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n      border: 2px dashed #CBCCCF;\n    }\n    \n    .discount_heading {\n      text-align: center;\n    }\n    \n    .discount_body {\n      text-align: center;\n      font-size: 15px;\n    }\n    /* Social Icons ------------------------------ */\n    \n    .social {\n      width: auto;\n    }\n    \n    .social td {\n      padding: 0;\n      width: auto;\n    }\n    \n    .social_icon {\n      height: 20px;\n      margin: 0 8px 10px 8px;\n      padding: 0;\n    }\n    /* Data table ------------------------------ */\n    \n    .purchase {\n      width: 100%;\n      margin: 0;\n      padding: 35px 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_content {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_item {\n      padding: 10px 0;\n      color: #51545E;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .purchase_heading {\n      padding-bottom: 8px;\n      border-bottom: 1px solid #EAEAEC;\n    }\n    \n    .purchase_heading p {\n      margin: 0;\n      color: #85878E;\n      font-size: 12px;\n    }\n    \n    .purchase_footer {\n      padding-top: 15px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .purchase_total {\n      margin: 0;\n      text-align: right;\n      font-weight: bold;\n      color: #333333;\n    }\n    \n    .purchase_total--label {\n      padding: 0 15px 0 0;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    \n    p {\n      color: #51545E;\n    }\n    \n    p.sub {\n      color: #6B6E76;\n    }\n    \n    .email-wrapper {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n    }\n    \n    .email-content {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    /* Masthead ----------------------- */\n    \n    .email-masthead {\n      padding: 25px 0;\n      text-align: center;\n    }\n    \n    .email-masthead_logo {\n      width: 94px;\n    }\n    \n    .email-masthead_name {\n      font-size: 16px;\n      font-weight: bold;\n      color: #A8AAAF;\n      text-decoration: none;\n      text-shadow: 0 1px 0 white;\n    }\n    /* Body ------------------------------ */\n    \n    .email-body {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n      border: solid;\n      border-width: 1px 0px;\n      border-color: #00000020;\n    }\n    \n    .email-body_inner {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n    }\n    \n    .email-footer {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .email-footer p {\n      color: #6B6E76;\n    }\n    \n    .body-action {\n      width: 100%;\n      margin: 30px auto;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .body-sub {\n      margin-top: 25px;\n      padding-top: 25px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .content-cell {\n      padding: 35px;\n    }\n    /*Media Queries ------------------------------ */\n    \n    @media only screen and (max-width: 600px) {\n      .email-body_inner,\n      .email-footer {\n        width: 100% !important;\n      }\n    }\n\n    @media (prefers-color-scheme: dark) {\n      body,\n      .email-body,\n      .email-body_inner {\n        background-color: #000 !important;\n        color: #FFF !important;\n      }\n\n      .email-body {\n        border-color: #FFFFFF60\n      }\n\n      .email-content,\n      .email-masthead,\n      .email-wrapper,\n      .email-footer {\n        background-color: #333333;\n      }\n\n      p,\n      ul,\n      ol,\n      blockquote,\n      span,\n      .purchase_item {\n        color: #C0C0C0E0 !important;\n      }\n\n      h1,\n      h2,\n      h3 {\n        color: #FFF !important;\n      }\n\n      .attributes_content,\n      .discount {\n        background-color: #222 !important;\n      }\n      .email-masthead_name {\n        text-shadow: none !important;\n      }\n    }\n        \n\n    :root {\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n    </style>\n    <!--[if mso]>\n    <style type=\"text/css\">\n      .f-fallback  {\n        font-family: Arial, sans-serif;\n      }\n    </style>\n  <![endif]-->\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    body {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    </style>\n  </head>\n  <body style=\"width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;\" bgcolor=\"#F4F4F7\">\n    <table class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;\" bgcolor=\"#F4F4F7\">\n      <tr>\n        <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n          <table class=\"email-content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;\">\n            <tr>\n              <td class=\"email-masthead\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;\" align=\"center\">\n                <a href=\"{{info.general_store_website}}\" class=\"f-fallback email-masthead_name\" style=\"color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;\">\n                {{info.general_store_name}}\n              </a>\n              </td>\n            </tr>\n            <!-- Email Body -->\n            <tr>\n              <td class=\"email-body\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;\" bgcolor=\"#FFFFFF\">\n                <table class=\"email-body_inner\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;\" bgcolor=\"#FFFFFF\">\n                  <!-- Body content -->\n                  <tr>\n                    <td class=\"content-cell\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 32px 8px;\">\n                      <div class=\"f-fallback\">\n                        <h1 style=\"margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;\" align=\"left\">Hi {{order.contact.firstname}},</h1>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Your order (<b>{{order.id}}</b>) was cancelled.</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">We have written some notes regarding:</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; margin: .4em 0 1.1875em; padding: 1rem; border-radius: 0.5rem\" class=\"attributes_content\">{{order.notes}}</p>\n\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">If you have any questions about this receipt, simply reply to this email or reach out to our <a href=\"mailto:{{info.general_store_support_email}}\" style=\"color: #3869D4;\">support team</a> for help.</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Cheers,\n                          <br />The {{info.general_store_name}} team</p>\n                        <!-- Action -->\n                        <table class=\"body-action\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 30px auto; padding: 0;\">\n                          <tr>\n                            <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <!-- Border based button\n           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->\n                              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                                    {{!-- <a href=\"{{action_url}}\" class=\"f-fallback button button--blue\" target=\"_blank\" style=\"color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;\">Download as PDF</a> --}}\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table>\n                        <!-- Sub copy -->\n                        \n                      </div>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                <table class=\"email-footer\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;\">\n                  <tr>\n                    <td class=\"content-cell\" align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;\">\n                      <p class=\"f-fallback sub align-center\" style=\"font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;\" align=\"center\">\n                        {{info.general_store_name}}                       \n                      </p>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>"),
    "template_text": base64_encode("[{{info.general_store_name}}] ({{info.general_store_website}})\n\n************\nHi {{order.contact.firstname}},\n************\n\nYour order ({{order.id}}) was cancelled.\n\nWe have written some notes regarding:\n\n============\n\n{{order.notes}}\n\n--------------\n\nIf you have any questions about this receipt, simply reply to this \nemail or reach out to our support team ( {{ info.general_store_support_email }} ) for help.\n\nCheers,\nThe {{info.general_store_name}} team\n\n\n{{info.general_store_name}}\n{{info.general_store_website}}"),
    "reference_example_input": {
        "order": {
            "notes": "We cancelled the order due to inventory shortage :(",
            "contact": {
                "email": "john@doe.com",
                "firstname": "John",
                "phone_number": "000-000-000",
                "customer_id": "cus_65f2ae6e8bf30e6cd0ca95fa"
            },
            "address": {},
            "status": {
                "checkout": {
                    "id": 0,
                    "name2": "created",
                    "name": "Created"
                },
                "payment": {
                    "id": 1,
                    "name": "Authorized",
                    "name2": "authorized"
                },
                "fulfillment": {
                    "id": 0,
                    "name2": "draft",
                    "name": "Draft"
                }
            },
            "pricing": {
                "evo": [
                    {
                        "quantity_discounted": 0,
                        "quantity_undiscounted": 11,
                        "subtotal": 1100,
                        "total": 1150
                    },
                    {
                        "quantity_discounted": 2,
                        "total_discount": 100,
                        "quantity_undiscounted": 9,
                        "discount": {
                            "active": true,
                            "handle": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
                            "title": "50% OFF Bundle: robot arms and legs (not recursive)",
                            "priority": 0,
                            "application": {
                                "id": 0,
                                "name": "Automatic",
                                "name2": "automatic"
                            },
                            "info": {
                                "details": {
                                    "meta": {
                                        "id": 4,
                                        "type": "bundle",
                                        "name": "Bundle Discount"
                                    },
                                    "extra": {
                                        "fixed": 0,
                                        "percent": 50,
                                        "recursive": false
                                    }
                                },
                                "filters": [
                                    {
                                        "meta": {
                                            "id": 4,
                                            "type": "product",
                                            "op": "p-in-tags",
                                            "name": "Product has Tag"
                                        },
                                        "value": [
                                            "robot_arm"
                                        ]
                                    },
                                    {
                                        "meta": {
                                            "id": 4,
                                            "type": "product",
                                            "op": "p-in-tags",
                                            "name": "Product has Tag"
                                        },
                                        "value": [
                                            "robot_leg"
                                        ]
                                    }
                                ]
                            }
                        },
                        "discount_code": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
                        "subtotal": 1000,
                        "total": 1050
                    }
                ],
                "shipping_method": {
                    "title": "",
                    "handle": "",
                    "price": 50
                },
                "subtotal_discount": 100,
                "subtotal_undiscounted": 1100,
                "subtotal": 1000,
                "total": 1050,
                "quantity_total": 11,
                "quantity_discounted": 2,
                "errors": []
            },
            "line_items": [
                {
                    "id": "robot-leg-white",
                    "qty": 3,
                    "data": {
                        "tags": [
                            "robot_leg"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Leg White",
                        "price": 100
                    }
                },
                {
                    "id": "battery",
                    "qty": 5,
                    "data": {
                        "tags": [
                            "would-not-be-discounted"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Battery",
                        "price": 100
                    }
                },
                {
                    "id": "robot-arm-red",
                    "qty": 2,
                    "data": {
                        "tags": [
                            "robot_arm"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Arm Red",
                        "price": 100
                    }
                },
                {
                    "id": "robot-arm-green",
                    "qty": 1,
                    "data": {
                        "tags": [
                            "robot_arm"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Arm Green",
                        "price": 100
                    }
                }
            ],
            "shipping_method": {
                "handle": "ship-fast",
                "title": "ship fast",
                "price": 50
            },
            "id": "order_65d774c6445e4581b9e34c11",
            "created_at": "2024-02-22T16:22:30.095Z",
            "updated_at": "2024-02-22T16:22:30.095Z"
        },
        "info": {
            "general_store_name": "Wush Wush Games",
            "general_store_website": "https://wush.games/",
            "general_store_description": "We sell retro video games",
            "general_confirm_email_base_url": "https://wush.games/confirm-email",
            "general_store_support_email": "support@wush.games"
        }
    },
    "handle": "order-cancelled",
    "id": "template_66f6d007000000986d783f60",
    "created_at": "2024-09-27T15:32:23.799Z",
    "updated_at": "2024-10-02T09:53:36.834Z",
    "search": [
        "handle:order-cancelled",
        "order-cancelled",
        "id:template_66f6d007000000986d783f60",
        "template_66f6d007000000986d783f60",
        "66f6d007000000986d783f60",
        "order",
        "cancelled",
        "order cancelled"
    ]
  },



  {
    "title": "Order Shipped",
    "template_html": base64_encode("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns=\"http://www.w3.org/1999/xhtml\" style=\"color-scheme: light dark; supported-color-schemes: light dark;\">\n  <head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"x-apple-disable-message-reformatting\" />\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n    <meta name=\"color-scheme\" content=\"light dark\" />\n    <meta name=\"supported-color-schemes\" content=\"light dark\" />\n    <title></title>\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    /* Base ------------------------------ */\n    \n    @import url(\"https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap\");\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    a {\n      color: #3869D4;\n    }\n    \n    a img {\n      border: none;\n    }\n    \n    td {\n      word-break: break-word;\n    }\n    \n    .preheader {\n      display: none !important;\n      visibility: hidden;\n      mso-hide: all;\n      font-size: 1px;\n      line-height: 1px;\n      max-height: 0;\n      max-width: 0;\n      opacity: 0;\n      overflow: hidden;\n    }\n    /* Type ------------------------------ */\n    \n    body,\n    td,\n    th {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    h1 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 22px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h2 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 16px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h3 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 14px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    td,\n    th {\n      font-size: 16px;\n    }\n    \n    p,\n    ul,\n    ol,\n    blockquote {\n      margin: .4em 0 1.1875em;\n      font-size: 16px;\n      line-height: 1.625;\n    }\n    \n    p.sub {\n      font-size: 13px;\n    }\n    /* Utilities ------------------------------ */\n    \n    .align-right {\n      text-align: right;\n    }\n    \n    .align-left {\n      text-align: left;\n    }\n    \n    .align-center {\n      text-align: center;\n    }\n    \n    .u-margin-bottom-none {\n      margin-bottom: 0;\n    }\n    /* Buttons ------------------------------ */\n    \n    .button {\n      background-color: #3869D4;\n      border-top: 10px solid #3869D4;\n      border-right: 18px solid #3869D4;\n      border-bottom: 10px solid #3869D4;\n      border-left: 18px solid #3869D4;\n      display: inline-block;\n      color: #FFF;\n      text-decoration: none;\n      border-radius: 3px;\n      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);\n      -webkit-text-size-adjust: none;\n      box-sizing: border-box;\n    }\n    \n    .button--green {\n      background-color: #22BC66;\n      border-top: 10px solid #22BC66;\n      border-right: 18px solid #22BC66;\n      border-bottom: 10px solid #22BC66;\n      border-left: 18px solid #22BC66;\n    }\n    \n    .button--red {\n      background-color: #FF6136;\n      border-top: 10px solid #FF6136;\n      border-right: 18px solid #FF6136;\n      border-bottom: 10px solid #FF6136;\n      border-left: 18px solid #FF6136;\n    }\n    \n    @media only screen and (max-width: 500px) {\n      .button {\n        width: 100% !important;\n        text-align: center !important;\n      }\n    }\n    /* Attribute list ------------------------------ */\n    \n    .attributes {\n      margin: 0 0 21px;\n    }\n    \n    .attributes_content {\n      background-color: #F4F4F7;\n      padding: 16px;\n    }\n    \n    .attributes_item {\n      padding: 0;\n    }\n    /* Related Items ------------------------------ */\n    \n    .related {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .related_item {\n      padding: 10px 0;\n      color: #CBCCCF;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .related_item-title {\n      display: block;\n      margin: .5em 0 0;\n    }\n    \n    .related_item-thumb {\n      display: block;\n      padding-bottom: 10px;\n    }\n    \n    .related_heading {\n      border-top: 1px solid #CBCCCF;\n      text-align: center;\n      padding: 25px 0 10px;\n    }\n    /* Discount Code ------------------------------ */\n    \n    .discount {\n      width: 100%;\n      margin: 0;\n      padding: 24px;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n      border: 2px dashed #CBCCCF;\n    }\n    \n    .discount_heading {\n      text-align: center;\n    }\n    \n    .discount_body {\n      text-align: center;\n      font-size: 15px;\n    }\n    /* Social Icons ------------------------------ */\n    \n    .social {\n      width: auto;\n    }\n    \n    .social td {\n      padding: 0;\n      width: auto;\n    }\n    \n    .social_icon {\n      height: 20px;\n      margin: 0 8px 10px 8px;\n      padding: 0;\n    }\n    /* Data table ------------------------------ */\n    \n    .purchase {\n      width: 100%;\n      margin: 0;\n      padding: 35px 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_content {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_item {\n      padding: 10px 0;\n      color: #51545E;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .purchase_heading {\n      padding-bottom: 8px;\n      border-bottom: 1px solid #EAEAEC;\n    }\n    \n    .purchase_heading p {\n      margin: 0;\n      color: #85878E;\n      font-size: 12px;\n    }\n    \n    .purchase_footer {\n      padding-top: 15px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .purchase_total {\n      margin: 0;\n      text-align: right;\n      font-weight: bold;\n      color: #333333;\n    }\n    \n    .purchase_total--label {\n      padding: 0 15px 0 0;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    \n    p {\n      color: #51545E;\n    }\n    \n    p.sub {\n      color: #6B6E76;\n    }\n    \n    .email-wrapper {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n    }\n    \n    .email-content {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    /* Masthead ----------------------- */\n    \n    .email-masthead {\n      padding: 25px 0;\n      text-align: center;\n    }\n    \n    .email-masthead_logo {\n      width: 94px;\n    }\n    \n    .email-masthead_name {\n      font-size: 16px;\n      font-weight: bold;\n      color: #A8AAAF;\n      text-decoration: none;\n      text-shadow: 0 1px 0 white;\n    }\n    /* Body ------------------------------ */\n    \n    .email-body {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n      border: solid;\n      border-width: 1px 0px;\n      border-color: #00000020\n\n    }\n    \n    .email-body_inner {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n    }\n    \n    .email-footer {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .email-footer p {\n      color: #6B6E76;\n    }\n    \n    .body-action {\n      width: 100%;\n      margin: 30px auto;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .body-sub {\n      margin-top: 25px;\n      padding-top: 25px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .content-cell {\n      padding: 35px;\n    }\n    /*Media Queries ------------------------------ */\n    \n    @media only screen and (max-width: 600px) {\n      .email-body_inner,\n      .email-footer {\n        width: 100% !important;\n      }\n    }\n    \n    @media (prefers-color-scheme: dark) {\n      body,\n      .email-body,\n      .email-body_inner {\n        background-color: #000 !important;\n        color: #FFF !important;\n      }\n\n      .email-body {\n        border-color: #FFFFFF60\n      }\n\n      .email-content,\n      .email-masthead,\n      .email-wrapper,\n      .email-footer {\n        background-color: #333333;\n      }\n\n      p,\n      ul,\n      ol,\n      blockquote,\n      span,\n      .purchase_item {\n        color: #C0C0C0E0 !important;\n      }\n\n      h1,\n      h2,\n      h3 {\n        color: #FFF !important;\n      }\n\n      .attributes_content,\n      .discount {\n        background-color: #222 !important;\n      }\n      .email-masthead_name {\n        text-shadow: none !important;\n      }\n    }\n    \n    :root {\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n    </style>\n    <!--[if mso]>\n    <style type=\"text/css\">\n      .f-fallback  {\n        font-family: Arial, sans-serif;\n      }\n    </style>\n  <![endif]-->\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    body {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    </style>\n  </head>\n  <body style=\"width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;\" bgcolor=\"#F4F4F7\">\n    <table class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;\" bgcolor=\"#F4F4F7\">\n      <tr>\n        <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n          <table class=\"email-content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;\">\n            <tr>\n              <td class=\"email-masthead\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;\" align=\"center\">\n                <a href=\"{{info.general_store_website}}\" class=\"f-fallback email-masthead_name\" style=\"color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;\">\n                {{info.general_store_name}}\n              </a>\n              </td>\n            </tr>\n            <!-- Email Body -->\n            <tr>\n              <td class=\"email-body\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;\" bgcolor=\"#FFFFFF\">\n                <table class=\"email-body_inner\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;\" bgcolor=\"#FFFFFF\">\n                  <!-- Body content -->\n                  <tr>\n                    <td class=\"content-cell\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 32px 8px;\">\n                      <div class=\"f-fallback\">\n                        <h1 style=\"margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;\" align=\"left\">Hi {{order.contact.firstname}},</h1>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Your order (<b>{{order.id}}</b>) was just shipped.</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">We have written some regarding shipping info</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; margin: .4em 0 1.1875em;  padding: 1rem; border-radius: 0.5rem\" class=\"attributes_content\">{{order.notes}}</p>\n\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">If you have any questions about this receipt, simply reply to this email or reach out to our <a href=\"mailto:{{info.general_store_support_email}}\" style=\"color: #3869D4;\">support team</a> for help.</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Cheers,\n                          <br />The {{info.general_store_name}} team</p>\n                        <!-- Action -->\n                        <table class=\"body-action\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 30px auto; padding: 0;\">\n                          <tr>\n                            <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <!-- Border based button\n           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->\n                              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                                    {{!-- <a href=\"{{action_url}}\" class=\"f-fallback button button--blue\" target=\"_blank\" style=\"color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;\">Download as PDF</a> --}}\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table>\n                        <!-- Sub copy -->\n                        \n                      </div>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                <table class=\"email-footer\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;\">\n                  <tr>\n                    <td class=\"content-cell\" align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;\">\n                      <p class=\"f-fallback sub align-center\" style=\"font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;\" align=\"center\">\n                        {{info.general_store_name}}                       \n                      </p>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>"),
    "template_text": base64_encode("[{{info.general_store_name}}] ({{info.general_store_website}})\n\n************\nHi {{order.contact.firstname}},\n************\n\nYour order ({{order.id}}) was just shipped.\n\nWe have written some regarding shipping info:\n\n============\n\n{{order.notes}}\n\n--------------\n\nIf you have any questions about this receipt, simply reply to this \nemail or reach out to our support team ( {{ info.general_store_support_email }} ) for help.\n\nCheers,\nThe {{info.general_store_name}} team\n\n\n{{info.general_store_name}}\n{{info.general_store_website}}"),
    "reference_example_input": {
        "order": {
            "notes": "Your shipping tracking is UPS-12hh12812h",
            "contact": {
                "email": "john@doe.com",
                "firstname": "John",
                "phone_number": "000-000-000",
                "customer_id": "cus_65f2ae6e8bf30e6cd0ca95fa"
            },
            "address": {},
            "status": {
                "checkout": {
                    "id": 0,
                    "name2": "created",
                    "name": "Created"
                },
                "payment": {
                    "id": 1,
                    "name": "Authorized",
                    "name2": "authorized"
                },
                "fulfillment": {
                    "id": 0,
                    "name2": "draft",
                    "name": "Draft"
                }
            },
            "pricing": {
                "evo": [
                    {
                        "quantity_discounted": 0,
                        "quantity_undiscounted": 11,
                        "subtotal": 1100,
                        "total": 1150
                    },
                    {
                        "quantity_discounted": 2,
                        "total_discount": 100,
                        "quantity_undiscounted": 9,
                        "discount": {
                            "active": true,
                            "handle": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
                            "title": "50% OFF Bundle: robot arms and legs (not recursive)",
                            "priority": 0,
                            "application": {
                                "id": 0,
                                "name": "Automatic",
                                "name2": "automatic"
                            },
                            "info": {
                                "details": {
                                    "meta": {
                                        "id": 4,
                                        "type": "bundle",
                                        "name": "Bundle Discount"
                                    },
                                    "extra": {
                                        "fixed": 0,
                                        "percent": 50,
                                        "recursive": false
                                    }
                                },
                                "filters": [
                                    {
                                        "meta": {
                                            "id": 4,
                                            "type": "product",
                                            "op": "p-in-tags",
                                            "name": "Product has Tag"
                                        },
                                        "value": [
                                            "robot_arm"
                                        ]
                                    },
                                    {
                                        "meta": {
                                            "id": 4,
                                            "type": "product",
                                            "op": "p-in-tags",
                                            "name": "Product has Tag"
                                        },
                                        "value": [
                                            "robot_leg"
                                        ]
                                    }
                                ]
                            }
                        },
                        "discount_code": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
                        "subtotal": 1000,
                        "total": 1050
                    }
                ],
                "shipping_method": {
                    "title": "",
                    "handle": "",
                    "price": 50
                },
                "subtotal_discount": 100,
                "subtotal_undiscounted": 1100,
                "subtotal": 1000,
                "total": 1050,
                "quantity_total": 11,
                "quantity_discounted": 2,
                "errors": []
            },
            "line_items": [
                {
                    "id": "robot-leg-white",
                    "qty": 3,
                    "data": {
                        "tags": [
                            "robot_leg"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Leg White",
                        "price": 100
                    }
                },
                {
                    "id": "battery",
                    "qty": 5,
                    "data": {
                        "tags": [
                            "would-not-be-discounted"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Battery",
                        "price": 100
                    }
                },
                {
                    "id": "robot-arm-red",
                    "qty": 2,
                    "data": {
                        "tags": [
                            "robot_arm"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Arm Red",
                        "price": 100
                    }
                },
                {
                    "id": "robot-arm-green",
                    "qty": 1,
                    "data": {
                        "tags": [
                            "robot_arm"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Arm Green",
                        "price": 100
                    }
                }
            ],
            "shipping_method": {
                "handle": "ship-fast",
                "title": "ship fast",
                "price": 50
            },
            "id": "order_65d774c6445e4581b9e34c11",
            "created_at": "2024-02-22T16:22:30.095Z",
            "updated_at": "2024-02-22T16:22:30.095Z"
        },
        "info": {
            "general_store_name": "Wush Wush Games",
            "general_store_website": "https://wush.games/",
            "general_store_description": "We sell retro video games",
            "general_confirm_email_base_url": "https://wush.games/confirm-email",
            "general_store_support_email": "support@wush.games"
        }
    },
    "handle": "order-shipped",
    "id": "template_66f6cf41000000986d783f5f",
    "created_at": "2024-09-27T15:29:05.474Z",
    "updated_at": "2024-10-02T09:53:04.068Z",
    "search": [
        "handle:order-shipped",
        "order-shipped",
        "id:template_66f6cf41000000986d783f5f",
        "template_66f6cf41000000986d783f5f",
        "66f6cf41000000986d783f5f",
        "order",
        "shipped",
        "order shipped"
    ]
  },



  {
    "title": "Forgot Password",
    "template_html": base64_encode("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns=\"http://www.w3.org/1999/xhtml\" style=\"color-scheme: light dark; supported-color-schemes: light dark;\">\n  <head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"x-apple-disable-message-reformatting\" />\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n    <meta name=\"color-scheme\" content=\"light dark\" />\n    <meta name=\"supported-color-schemes\" content=\"light dark\" />\n    <title></title>\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    /* Base ------------------------------ */\n    \n    @import url(\"https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap\");\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    a {\n      color: #3869D4;\n    }\n    \n    a img {\n      border: none;\n    }\n    \n    td {\n      word-break: break-word;\n    }\n    \n    .preheader {\n      display: none !important;\n      visibility: hidden;\n      mso-hide: all;\n      font-size: 1px;\n      line-height: 1px;\n      max-height: 0;\n      max-width: 0;\n      opacity: 0;\n      overflow: hidden;\n    }\n    /* Type ------------------------------ */\n    \n    body,\n    td,\n    th {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    h1 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 22px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h2 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 16px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h3 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 14px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    td,\n    th {\n      font-size: 16px;\n    }\n    \n    p,\n    ul,\n    ol,\n    blockquote {\n      margin: .4em 0 1.1875em;\n      font-size: 16px;\n      line-height: 1.625;\n    }\n    \n    p.sub {\n      font-size: 13px;\n    }\n    /* Utilities ------------------------------ */\n    \n    .align-right {\n      text-align: right;\n    }\n    \n    .align-left {\n      text-align: left;\n    }\n    \n    .align-center {\n      text-align: center;\n    }\n    \n    .u-margin-bottom-none {\n      margin-bottom: 0;\n    }\n    /* Buttons ------------------------------ */\n    \n    .button {\n      background-color: #3869D4;\n      border-top: 10px solid #3869D4;\n      border-right: 18px solid #3869D4;\n      border-bottom: 10px solid #3869D4;\n      border-left: 18px solid #3869D4;\n      display: inline-block;\n      color: #FFF;\n      text-decoration: none;\n      border-radius: 3px;\n      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);\n      -webkit-text-size-adjust: none;\n      box-sizing: border-box;\n    }\n    \n    .button--green {\n      background-color: #22BC66;\n      border-top: 10px solid #22BC66;\n      border-right: 18px solid #22BC66;\n      border-bottom: 10px solid #22BC66;\n      border-left: 18px solid #22BC66;\n    }\n    \n    .button--red {\n      background-color: #FF6136;\n      border-top: 10px solid #FF6136;\n      border-right: 18px solid #FF6136;\n      border-bottom: 10px solid #FF6136;\n      border-left: 18px solid #FF6136;\n    }\n    \n    @media only screen and (max-width: 500px) {\n      .button {\n        width: 100% !important;\n        text-align: center !important;\n      }\n    }\n    /* Attribute list ------------------------------ */\n    \n    .attributes {\n      margin: 0 0 21px;\n    }\n    \n    .attributes_content {\n      background-color: #F4F4F7;\n      padding: 16px;\n    }\n    \n    .attributes_item {\n      padding: 0;\n    }\n    /* Related Items ------------------------------ */\n    \n    .related {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .related_item {\n      padding: 10px 0;\n      color: #CBCCCF;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .related_item-title {\n      display: block;\n      margin: .5em 0 0;\n    }\n    \n    .related_item-thumb {\n      display: block;\n      padding-bottom: 10px;\n    }\n    \n    .related_heading {\n      border-top: 1px solid #CBCCCF;\n      text-align: center;\n      padding: 25px 0 10px;\n    }\n    /* Discount Code ------------------------------ */\n    \n    .discount {\n      width: 100%;\n      margin: 0;\n      padding: 24px;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n      border: 2px dashed #CBCCCF;\n    }\n    \n    .discount_heading {\n      text-align: center;\n    }\n    \n    .discount_body {\n      text-align: center;\n      font-size: 15px;\n    }\n    /* Social Icons ------------------------------ */\n    \n    .social {\n      width: auto;\n    }\n    \n    .social td {\n      padding: 0;\n      width: auto;\n    }\n    \n    .social_icon {\n      height: 20px;\n      margin: 0 8px 10px 8px;\n      padding: 0;\n    }\n    /* Data table ------------------------------ */\n    \n    .purchase {\n      width: 100%;\n      margin: 0;\n      padding: 35px 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_content {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_item {\n      padding: 10px 0;\n      color: #51545E;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .purchase_heading {\n      padding-bottom: 8px;\n      border-bottom: 1px solid #EAEAEC;\n    }\n    \n    .purchase_heading p {\n      margin: 0;\n      color: #85878E;\n      font-size: 12px;\n    }\n    \n    .purchase_footer {\n      padding-top: 15px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .purchase_total {\n      margin: 0;\n      text-align: right;\n      font-weight: bold;\n      color: #333333;\n    }\n    \n    .purchase_total--label {\n      padding: 0 15px 0 0;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    \n    p {\n      color: #51545E;\n    }\n    \n    p.sub {\n      color: #6B6E76;\n    }\n    \n    .email-wrapper {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n    }\n    \n    .email-content {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    /* Masthead ----------------------- */\n    \n    .email-masthead {\n      padding: 25px 0;\n      text-align: center;\n    }\n    \n    .email-masthead_logo {\n      width: 94px;\n    }\n    \n    .email-masthead_name {\n      font-size: 16px;\n      font-weight: bold;\n      color: #A8AAAF;\n      text-decoration: none;\n      text-shadow: 0 1px 0 white;\n    }\n    /* Body ------------------------------ */\n    \n    .email-body {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n      border: solid;\n      border-width: 1px 0px;\n      border-color: #00000020\n    }\n    \n    .email-body_inner {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n    }\n    \n    .email-footer {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .email-footer p {\n      color: #6B6E76;\n    }\n    \n    .body-action {\n      width: 100%;\n      margin: 30px auto;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .body-sub {\n      margin-top: 25px;\n      padding-top: 25px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .content-cell {\n      padding: 35px;\n    }\n    /*Media Queries ------------------------------ */\n    \n    @media only screen and (max-width: 600px) {\n      .email-body_inner,\n      .email-footer {\n        width: 100% !important;\n      }\n    }\n    \n    @media (prefers-color-scheme: dark) {\n      body,\n      .email-body,\n      .email-body_inner {\n        background-color: #000 !important;\n        color: #FFF !important;\n      }\n\n      .email-body {\n        border-color: #FFFFFF60\n      }\n\n      .email-content,\n      .email-masthead,\n      .email-wrapper,\n      .email-footer {\n        background-color: #333333;\n      }\n\n      p,\n      ul,\n      ol,\n      blockquote,\n      span,\n      .purchase_item {\n        color: #C0C0C0E0 !important;\n      }\n\n      h1,\n      h2,\n      h3 {\n        color: #FFF !important;\n      }\n\n      .attributes_content,\n      .discount {\n        background-color: #222 !important;\n      }\n      .email-masthead_name {\n        text-shadow: none !important;\n      }\n    }\n    \n    :root {\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n    </style>\n    <!--[if mso]>\n    <style type=\"text/css\">\n      .f-fallback  {\n        font-family: Arial, sans-serif;\n      }\n    </style>\n  <![endif]-->\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    body {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    </style>\n  </head>\n  <body style=\"width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;\" bgcolor=\"#F4F4F7\">\n    <span class=\"preheader\" style=\"display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;\">Thanks for signing up with us. We’re thrilled to have you on board.</span>\n    <table class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;\" bgcolor=\"#F4F4F7\">\n      <tr>\n        <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n          <table class=\"email-content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;\">\n            <tr>\n              <td class=\"email-masthead\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;\" align=\"center\">\n                <a href=\"{{info.general_store_website}}\" class=\"f-fallback email-masthead_name\" style=\"color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;\">\n                {{info.general_store_name}}\n              </a>\n              </td>\n            </tr>\n            <!-- Email Body -->\n            <tr>\n              <td class=\"email-body\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;\" bgcolor=\"#FFFFFF\">\n                <table class=\"email-body_inner\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;\" bgcolor=\"#FFFFFF\">\n                  <!-- Body content -->\n                  <tr>\n                    <td class=\"content-cell\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 32px 8px;\">\n                      <div class=\"f-fallback\">\n                        <h1 style=\"margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;\" align=\"left\">Hi,</h1>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">We received you request about forgotten password. If it was you, please click the following button to confirm and reset the password</p>\n                        <!-- Action -->\n                        <table class=\"body-action\" align=\"center\" width=\"100%\" cellpadding=\"50\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0px auto; padding: 0;\">\n                          <tr>\n                            <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <!-- Border based button\n           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->\n\n                              {{#if info.general_forgot_password_confirm_base_url }}\n                              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                                    <a href=\"{{info.general_forgot_password_confirm_base_url}}?token={{token}}\" class=\"f-fallback button\" target=\"_blank\" style=\"color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;\">Confirm password reset</a>\n                                  </td>\n                                </tr>\n                              </table>\n                              {{/if}}\n\n                            </td>\n                          </tr>\n                        </table>\n                        {{!-- <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">For reference, here's your login information:</p>\n                        <table class=\"attributes\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"margin: 0 0 21px;\">\n                          <tr>\n                            <td class=\"attributes_content\" style=\"border-radius: 0.5rem; word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; background-color: #F4F4F7; padding: 16px;\" bgcolor=\"#F4F4F7\">\n                              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td class=\"attributes_item\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;\">\n                                    <span class=\"f-fallback\">\n                                      <strong>User ID:</strong> {{customer.id}}\n                                    </span>\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table> --}}\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Need help, or have any questions ? Simply reply to this email, we'd love to help</p>\n                        <!-- Sub copy -->\n                        \n                      </div>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                <table class=\"email-footer\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;\">\n                  <tr>\n                    <td class=\"content-cell\" align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;\">\n                      <p class=\"f-fallback sub align-center\" style=\"font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;\" align=\"center\">\n                        {{info.general_store_name}}\n                      </p>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>"),
    "template_text": base64_encode("\nHi,\n\nWe received you request about forgotten password. \nIf it was you, please click the following button to confirm and reset the password,\n\n{{#if info.general_forgot_password_confirm_base_url}}\nConfirm password reset here: \n{{ info.general_forgot_password_confirm_base_url}}?token={{token}}\n{{/if}}\n\nNeed help, or have any questions ?\nSimply reply to this email, we'd love to help\n\n[{{info.general_store_name}}] ({{info.general_store_website}})\n"),
    "reference_example_input": {
        "info": {
            "general_store_name": "Wush Wush Games",
            "general_store_website": "https://wush.games/",
            "general_store_description": "We sell retro video games",
            "general_forgot_password_confirm_base_url": "https://wush.games/confirm-forgot-password-request"
        },
        "token": "CONFIRMATION_TOKEN"
    },
    "handle": "forgot-password",
    "id": "template_66faab7f0000004c213e7e65",
    "created_at": "2024-09-30T13:45:35.963Z",
    "updated_at": "2024-10-02T09:52:28.219Z",
    "search": [
        "handle:forgot-password",
        "forgot-password",
        "id:template_66faab7f0000004c213e7e65",
        "template_66faab7f0000004c213e7e65",
        "66faab7f0000004c213e7e65",
        "forgot",
        "password",
        "forgot password"
    ]
  },



  {
    "title": "Welcome Customer",
    "template_html": base64_encode("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns=\"http://www.w3.org/1999/xhtml\" style=\"color-scheme: light dark; supported-color-schemes: light dark;\">\n  <head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"x-apple-disable-message-reformatting\" />\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n    <meta name=\"color-scheme\" content=\"light dark\" />\n    <meta name=\"supported-color-schemes\" content=\"light dark\" />\n    <title></title>\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    /* Base ------------------------------ */\n    \n    @import url(\"https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap\");\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    a {\n      color: #3869D4;\n    }\n    \n    a img {\n      border: none;\n    }\n    \n    td {\n      word-break: break-word;\n    }\n    \n    .preheader {\n      display: none !important;\n      visibility: hidden;\n      mso-hide: all;\n      font-size: 1px;\n      line-height: 1px;\n      max-height: 0;\n      max-width: 0;\n      opacity: 0;\n      overflow: hidden;\n    }\n    /* Type ------------------------------ */\n    \n    body,\n    td,\n    th {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    h1 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 22px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h2 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 16px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h3 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 14px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    td,\n    th {\n      font-size: 16px;\n    }\n    \n    p,\n    ul,\n    ol,\n    blockquote {\n      margin: .4em 0 1.1875em;\n      font-size: 16px;\n      line-height: 1.625;\n    }\n    \n    p.sub {\n      font-size: 13px;\n    }\n    /* Utilities ------------------------------ */\n    \n    .align-right {\n      text-align: right;\n    }\n    \n    .align-left {\n      text-align: left;\n    }\n    \n    .align-center {\n      text-align: center;\n    }\n    \n    .u-margin-bottom-none {\n      margin-bottom: 0;\n    }\n    /* Buttons ------------------------------ */\n    \n    .button {\n      background-color: #3869D4;\n      border-top: 10px solid #3869D4;\n      border-right: 18px solid #3869D4;\n      border-bottom: 10px solid #3869D4;\n      border-left: 18px solid #3869D4;\n      display: inline-block;\n      color: #FFF;\n      text-decoration: none;\n      border-radius: 3px;\n      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);\n      -webkit-text-size-adjust: none;\n      box-sizing: border-box;\n    }\n    \n    .button--green {\n      background-color: #22BC66;\n      border-top: 10px solid #22BC66;\n      border-right: 18px solid #22BC66;\n      border-bottom: 10px solid #22BC66;\n      border-left: 18px solid #22BC66;\n    }\n    \n    .button--red {\n      background-color: #FF6136;\n      border-top: 10px solid #FF6136;\n      border-right: 18px solid #FF6136;\n      border-bottom: 10px solid #FF6136;\n      border-left: 18px solid #FF6136;\n    }\n    \n    @media only screen and (max-width: 500px) {\n      .button {\n        width: 100% !important;\n        text-align: center !important;\n      }\n    }\n    /* Attribute list ------------------------------ */\n    \n    .attributes {\n      margin: 0 0 21px;\n    }\n    \n    .attributes_content {\n      background-color: #F4F4F7;\n      padding: 16px;\n    }\n    \n    .attributes_item {\n      padding: 0;\n    }\n    /* Related Items ------------------------------ */\n    \n    .related {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .related_item {\n      padding: 10px 0;\n      color: #CBCCCF;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .related_item-title {\n      display: block;\n      margin: .5em 0 0;\n    }\n    \n    .related_item-thumb {\n      display: block;\n      padding-bottom: 10px;\n    }\n    \n    .related_heading {\n      border-top: 1px solid #CBCCCF;\n      text-align: center;\n      padding: 25px 0 10px;\n    }\n    /* Discount Code ------------------------------ */\n    \n    .discount {\n      width: 100%;\n      margin: 0;\n      padding: 24px;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n      border: 2px dashed #CBCCCF;\n    }\n    \n    .discount_heading {\n      text-align: center;\n    }\n    \n    .discount_body {\n      text-align: center;\n      font-size: 15px;\n    }\n    /* Social Icons ------------------------------ */\n    \n    .social {\n      width: auto;\n    }\n    \n    .social td {\n      padding: 0;\n      width: auto;\n    }\n    \n    .social_icon {\n      height: 20px;\n      margin: 0 8px 10px 8px;\n      padding: 0;\n    }\n    /* Data table ------------------------------ */\n    \n    .purchase {\n      width: 100%;\n      margin: 0;\n      padding: 35px 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_content {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_item {\n      padding: 10px 0;\n      color: #51545E;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .purchase_heading {\n      padding-bottom: 8px;\n      border-bottom: 1px solid #EAEAEC;\n    }\n    \n    .purchase_heading p {\n      margin: 0;\n      color: #85878E;\n      font-size: 12px;\n    }\n    \n    .purchase_footer {\n      padding-top: 15px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .purchase_total {\n      margin: 0;\n      text-align: right;\n      font-weight: bold;\n      color: #333333;\n    }\n    \n    .purchase_total--label {\n      padding: 0 15px 0 0;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    \n    p {\n      color: #51545E;\n    }\n    \n    p.sub {\n      color: #6B6E76;\n    }\n    \n    .email-wrapper {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n    }\n    \n    .email-content {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    /* Masthead ----------------------- */\n    \n    .email-masthead {\n      padding: 25px 0;\n      text-align: center;\n    }\n    \n    .email-masthead_logo {\n      width: 94px;\n    }\n    \n    .email-masthead_name {\n      font-size: 16px;\n      font-weight: bold;\n      color: #A8AAAF;\n      text-decoration: none;\n      text-shadow: 0 1px 0 white;\n    }\n    /* Body ------------------------------ */\n    \n    .email-body {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n      border: solid;\n      border-width: 1px 0px;\n      border-color: #00000020\n    }\n    \n    .email-body_inner {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n    }\n    \n    .email-footer {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .email-footer p {\n      color: #6B6E76;\n    }\n    \n    .body-action {\n      width: 100%;\n      margin: 30px auto;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .body-sub {\n      margin-top: 25px;\n      padding-top: 25px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .content-cell {\n      padding: 35px;\n    }\n    /*Media Queries ------------------------------ */\n    \n    @media only screen and (max-width: 600px) {\n      .email-body_inner,\n      .email-footer {\n        width: 100% !important;\n      }\n    }\n    \n    @media (prefers-color-scheme: dark) {\n      body,\n      .email-body,\n      .email-body_inner {\n        background-color: #000 !important;\n        color: #FFF !important;\n      }\n\n      .email-body {\n        border-color: #FFFFFF60\n      }\n\n      .email-content,\n      .email-masthead,\n      .email-wrapper,\n      .email-footer {\n        background-color: #333333;\n      }\n\n      p,\n      ul,\n      ol,\n      blockquote,\n      span,\n      .purchase_item {\n        color: #C0C0C0E0 !important;\n      }\n\n      h1,\n      h2,\n      h3 {\n        color: #FFF !important;\n      }\n\n      .attributes_content,\n      .discount {\n        background-color: #222 !important;\n      }\n      .email-masthead_name {\n        text-shadow: none !important;\n      }\n    }\n    \n    :root {\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n    </style>\n    <!--[if mso]>\n    <style type=\"text/css\">\n      .f-fallback  {\n        font-family: Arial, sans-serif;\n      }\n    </style>\n  <![endif]-->\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    body {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    </style>\n  </head>\n  <body style=\"width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;\" bgcolor=\"#F4F4F7\">\n    <span class=\"preheader\" style=\"display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;\">Thanks for signing up with us. We’re thrilled to have you on board.</span>\n    <table class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;\" bgcolor=\"#F4F4F7\">\n      <tr>\n        <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n          <table class=\"email-content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;\">\n            <tr>\n              <td class=\"email-masthead\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;\" align=\"center\">\n                <a href=\"{{info.general_store_website}}\" class=\"f-fallback email-masthead_name\" style=\"color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;\">\n                {{info.general_store_name}}\n              </a>\n              </td>\n            </tr>\n            <!-- Email Body -->\n            <tr>\n              <td class=\"email-body\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;\" bgcolor=\"#FFFFFF\">\n                <table class=\"email-body_inner\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;\" bgcolor=\"#FFFFFF\">\n                  <!-- Body content -->\n                  <tr>\n                    <td class=\"content-cell\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 32px 8px;\">\n                      <div class=\"f-fallback\">\n                        <h1 style=\"margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;\" align=\"left\">Welcome, {{customer.firstname}}!</h1>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Thanks for signing up with us. We’re thrilled to have you on board.</p>\n                        <!-- Action -->\n                        <table class=\"body-action\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0px auto; padding: 0;\">\n                          <tr>\n                            <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <!-- Border based button\n           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->\n\n                              {{#if info.general_confirm_email_base_url }}\n                              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"50\" role=\"presentation\">\n                                <tr>\n                                  <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                                    <a href=\"{{info.general_confirm_email_base_url}}?token={{token}}\" class=\"f-fallback button\" target=\"_blank\" style=\"color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;\">Confirm your email</a>\n                                  </td>\n                                </tr>\n                              </table>\n                              {{/if}}\n\n                            </td>\n                          </tr>\n                        </table>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">For reference, here's your login information:</p>\n                        <table class=\"attributes\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"margin: 0 0 21px;\">\n                          <tr>\n                            <td class=\"attributes_content\" style=\"border-radius: 0.5rem; word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; background-color: #F4F4F7; padding: 16px;\" bgcolor=\"#F4F4F7\">\n                              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td class=\"attributes_item\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;\">\n                                    <span class=\"f-fallback\">\n                                      <strong>User ID:</strong> {{customer.id}}\n                                    </span>\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Need help, or have any questions ? Simply reply to this email, we'd love to help</p>\n                        <!-- Sub copy -->\n                        \n                      </div>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                <table class=\"email-footer\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;\">\n                  <tr>\n                    <td class=\"content-cell\" align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;\">\n                      <p class=\"f-fallback sub align-center\" style=\"font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;\" align=\"center\">\n                        {{info.general_store_name}}\n                      </p>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>"),
    "template_text": base64_encode("Thanks for signing up with us. \nWe’re thrilled to have you on board.\n\n******************\nWelcome, {{customer.firstname}}!\n******************\n\nThanks for signing up with us. We’re thrilled to \nhave you on board.\n\n{{#if info.general_confirm_email_base_url}}\nConfirm your email here: \n{{info.general_confirm_email_base_url}}?token={{token}}\n{{/if}}\n\nFor reference, here's your login information:\n\nUser ID: {{customer.id}}\n\nNeed help, or have any questions ?\nSimply reply to this email, we'd love to help\n\n[{{info.general_store_name}}] ({{info.general_store_website}})\n"),
    "reference_example_input": {
        "customer": {
            "email": "john@dow.com",
            "firstname": "John",
            "lastname": "Dow",
            "id": "cus_65f2ae6e8bf30e6cd0ca95fa"
        },
        "info": {
            "general_store_name": "Wush Wush Games",
            "general_store_website": "https://wush.games/",
            "general_store_description": "We sell retro video games",
            "general_confirm_email_base_url": "https://wush.games/confirm-email"
        },
        "token": "CONFIRMATION_TOKEN"
    },
    "handle": "welcome-customer",
    "id": "template_664afed24eba71b9ee185be4",
    "created_at": "2024-05-20T07:42:10.436Z",
    "updated_at": "2024-10-02T09:51:59.802Z",
    "search": [
        "handle:welcome-customer",
        "welcome-customer",
        "id:template_664afed24eba71b9ee185be4",
        "template_664afed24eba71b9ee185be4",
        "664afed24eba71b9ee185be4",
        "welcome",
        "customer",
        "welcome customer"
    ]
  },


  {
    "title": "General Message",
    "template_html": base64_encode("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns=\"http://www.w3.org/1999/xhtml\" style=\"color-scheme: light dark; supported-color-schemes: light dark;\">\n  <head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"x-apple-disable-message-reformatting\" />\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n    <meta name=\"color-scheme\" content=\"light dark\" />\n    <meta name=\"supported-color-schemes\" content=\"light dark\" />\n    <title></title>\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    /* Base ------------------------------ */\n    \n    @import url(\"https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap\");\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    a {\n      color: #3869D4;\n    }\n    \n    a img {\n      border: none;\n    }\n    \n    td {\n      word-break: break-word;\n    }\n    \n    .preheader {\n      display: none !important;\n      visibility: hidden;\n      mso-hide: all;\n      font-size: 1px;\n      line-height: 1px;\n      max-height: 0;\n      max-width: 0;\n      opacity: 0;\n      overflow: hidden;\n    }\n    /* Type ------------------------------ */\n    \n    body,\n    td,\n    th {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    h1 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 22px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h2 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 16px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h3 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 14px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    td,\n    th {\n      font-size: 16px;\n    }\n    \n    p,\n    ul,\n    ol,\n    blockquote {\n      margin: .4em 0 1.1875em;\n      font-size: 16px;\n      line-height: 1.625;\n    }\n    \n    p.sub {\n      font-size: 13px;\n    }\n    /* Utilities ------------------------------ */\n    \n    .align-right {\n      text-align: right;\n    }\n    \n    .align-left {\n      text-align: left;\n    }\n    \n    .align-center {\n      text-align: center;\n    }\n    \n    .u-margin-bottom-none {\n      margin-bottom: 0;\n    }\n    /* Buttons ------------------------------ */\n    \n    .button {\n      background-color: #3869D4;\n      border-top: 10px solid #3869D4;\n      border-right: 18px solid #3869D4;\n      border-bottom: 10px solid #3869D4;\n      border-left: 18px solid #3869D4;\n      display: inline-block;\n      color: #FFF;\n      text-decoration: none;\n      border-radius: 3px;\n      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);\n      -webkit-text-size-adjust: none;\n      box-sizing: border-box;\n    }\n    \n    .button--green {\n      background-color: #22BC66;\n      border-top: 10px solid #22BC66;\n      border-right: 18px solid #22BC66;\n      border-bottom: 10px solid #22BC66;\n      border-left: 18px solid #22BC66;\n    }\n    \n    .button--red {\n      background-color: #FF6136;\n      border-top: 10px solid #FF6136;\n      border-right: 18px solid #FF6136;\n      border-bottom: 10px solid #FF6136;\n      border-left: 18px solid #FF6136;\n    }\n    \n    @media only screen and (max-width: 500px) {\n      .button {\n        width: 100% !important;\n        text-align: center !important;\n      }\n    }\n    /* Attribute list ------------------------------ */\n    \n    .attributes {\n      margin: 0 0 21px;\n    }\n    \n    .attributes_content {\n      background-color: #F4F4F7;\n      padding: 16px;\n    }\n    \n    .attributes_item {\n      padding: 0;\n    }\n    /* Related Items ------------------------------ */\n    \n    .related {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .related_item {\n      padding: 10px 0;\n      color: #CBCCCF;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .related_item-title {\n      display: block;\n      margin: .5em 0 0;\n    }\n    \n    .related_item-thumb {\n      display: block;\n      padding-bottom: 10px;\n    }\n    \n    .related_heading {\n      border-top: 1px solid #CBCCCF;\n      text-align: center;\n      padding: 25px 0 10px;\n    }\n    /* Discount Code ------------------------------ */\n    \n    .discount {\n      width: 100%;\n      margin: 0;\n      padding: 24px;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n      border: 2px dashed #CBCCCF;\n    }\n    \n    .discount_heading {\n      text-align: center;\n    }\n    \n    .discount_body {\n      text-align: center;\n      font-size: 15px;\n    }\n    /* Social Icons ------------------------------ */\n    \n    .social {\n      width: auto;\n    }\n    \n    .social td {\n      padding: 0;\n      width: auto;\n    }\n    \n    .social_icon {\n      height: 20px;\n      margin: 0 8px 10px 8px;\n      padding: 0;\n    }\n    /* Data table ------------------------------ */\n    \n    .purchase {\n      width: 100%;\n      margin: 0;\n      padding: 35px 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_content {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_item {\n      padding: 10px 0;\n      color: #51545E;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .purchase_heading {\n      padding-bottom: 8px;\n      border-bottom: 1px solid #EAEAEC;\n    }\n    \n    .purchase_heading p {\n      margin: 0;\n      color: #85878E;\n      font-size: 12px;\n    }\n    \n    .purchase_footer {\n      padding-top: 15px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .purchase_total {\n      margin: 0;\n      text-align: right;\n      font-weight: bold;\n      color: #333333;\n    }\n    \n    .purchase_total--label {\n      padding: 0 15px 0 0;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    \n    p {\n      color: #51545E;\n    }\n    \n    p.sub {\n      color: #6B6E76;\n    }\n    \n    .email-wrapper {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n    }\n    \n    .email-content {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    /* Masthead ----------------------- */\n    \n    .email-masthead {\n      padding: 25px 0;\n      text-align: center;\n    }\n    \n    .email-masthead_logo {\n      width: 94px;\n    }\n    \n    .email-masthead_name {\n      font-size: 16px;\n      font-weight: bold;\n      color: #A8AAAF;\n      text-decoration: none;\n      text-shadow: 0 1px 0 white;\n    }\n    /* Body ------------------------------ */\n    \n    .email-body {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n      border: solid;\n      border-width: 1px 0px;\n      border-color: #00000020\n    }\n    \n    .email-body_inner {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n    }\n    \n    .email-footer {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .email-footer p {\n      color: #6B6E76;\n    }\n    \n    .body-action {\n      width: 100%;\n      margin: 30px auto;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .body-sub {\n      margin-top: 25px;\n      padding-top: 25px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .content-cell {\n      padding: 35px;\n    }\n    /*Media Queries ------------------------------ */\n    \n    @media only screen and (max-width: 600px) {\n      .email-body_inner,\n      .email-footer {\n        width: 100% !important;\n      }\n    }\n    \n    @media (prefers-color-scheme: dark) {\n      body,\n      .email-body,\n      .email-body_inner {\n        background-color: #000 !important;\n        color: #FFF !important;\n      }\n\n      .email-body {\n        border-color: #FFFFFF60\n      }\n\n      .email-content,\n      .email-masthead,\n      .email-wrapper,\n      .email-footer {\n        background-color: #333333;\n      }\n\n      p,\n      ul,\n      ol,\n      blockquote,\n      span,\n      .purchase_item {\n        color: #C0C0C0E0 !important;\n      }\n\n      h1,\n      h2,\n      h3 {\n        color: #FFF !important;\n      }\n\n      .attributes_content,\n      .discount {\n        background-color: #222 !important;\n      }\n      .email-masthead_name {\n        text-shadow: none !important;\n      }\n    }\n    \n    :root {\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n    </style>\n    <!--[if mso]>\n    <style type=\"text/css\">\n      .f-fallback  {\n        font-family: Arial, sans-serif;\n      }\n    </style>\n  <![endif]-->\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    body {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    </style>\n  </head>\n  <body style=\"width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;\" bgcolor=\"#F4F4F7\">\n    <table class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;\" bgcolor=\"#F4F4F7\">\n      <tr>\n        <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n          <table class=\"email-content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;\">\n            <tr>\n              <td class=\"email-masthead\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;\" align=\"center\">\n                <a href=\"{{info.general_store_website}}\" class=\"f-fallback email-masthead_name\" style=\"color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;\">\n                {{info.general_store_name}}\n              </a>\n              </td>\n            </tr>\n            <!-- Email Body -->\n            <tr>\n              <td class=\"email-body\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;\" bgcolor=\"#FFFFFF\">\n                <table class=\"email-body_inner\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;\" bgcolor=\"#FFFFFF\">\n                  <!-- Body content -->\n                  <tr>\n                    <td class=\"content-cell\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 32px 8px;\">\n                      <div class=\"f-fallback\">\n                        <h1 style=\"margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;\" align=\"left\">Hi {{firstname}},</h1>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">{{message}}</p>\n                        <!-- Action -->\n                        <table class=\"body-action\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0px auto; padding: 0;\">\n                          <tr>\n                            <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <!-- Border based button\n           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->\n\n\n                            </td>\n                          </tr>\n                        </table>\n                        {{!-- <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">For reference, here's your login information:</p>\n                        <table class=\"attributes\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"margin: 0 0 21px;\">\n                          <tr>\n                            <td class=\"attributes_content\" style=\"border-radius: 0.5rem; word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; background-color: #F4F4F7; padding: 16px;\" bgcolor=\"#F4F4F7\">\n                              <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td class=\"attributes_item\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;\">\n                                    <span class=\"f-fallback\">\n                                      <strong>User ID:</strong> {{customer.id}}\n                                    </span>\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table> --}}\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Need help, or have any questions ? Simply reply to this email, we'd love to help</p>\n                        <!-- Sub copy -->\n                        \n                      </div>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                <table class=\"email-footer\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;\">\n                  <tr>\n                    <td class=\"content-cell\" align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;\">\n                      <p class=\"f-fallback sub align-center\" style=\"font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;\" align=\"center\">\n                        {{info.general_store_name}}\n                      </p>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>"),
    "template_text": base64_encode("\nHi {{firstname}},\n\n{{message}}\n\nNeed help, or have any questions ?\nSimply reply to this email, we'd love to help\n\n[{{info.general_store_name}}] ({{info.general_store_website}})\n"),
    "reference_example_input": {
        "info": {
            "general_store_name": "Wush Wush Games",
            "general_store_website": "https://wush.games/",
            "general_store_description": "We sell retro video games"
        },
        "message": "we wanted to inform you ...",
        "firstname": "John"
    },
    "handle": "general-message",
    "id": "template_66facc7c0000006785218716",
    "created_at": "2024-09-30T16:06:20.061Z",
    "updated_at": "2024-10-02T09:50:55.773Z",
    "search": [
        "handle:general-message",
        "general-message",
        "id:template_66facc7c0000006785218716",
        "template_66facc7c0000006785218716",
        "66facc7c0000006785218716",
        "general",
        "message",
        "general message"
    ]
  },


  {
    "title": "Checkout Complete",
    "template_html": base64_encode("<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns=\"http://www.w3.org/1999/xhtml\" style=\"color-scheme: light; supported-color-schemes: light dark;\">\n  <head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <meta name=\"x-apple-disable-message-reformatting\" />\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\n    <meta name=\"color-scheme\" content=\"light\" />\n    <meta name=\"supported-color-schemes\" content=\"light dark\" />\n    <title></title>\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    /* Base ------------------------------ */\n    \n    @import url(\"https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap\");\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    a {\n      color: #3869D4;\n    }\n    \n    a img {\n      border: none;\n    }\n    \n    td {\n      word-break: break-word;\n    }\n    \n    .preheader {\n      display: none !important;\n      visibility: hidden;\n      mso-hide: all;\n      font-size: 1px;\n      line-height: 1px;\n      max-height: 0;\n      max-width: 0;\n      opacity: 0;\n      overflow: hidden;\n    }\n    /* Type ------------------------------ */\n    \n    body,\n    td,\n    th {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    h1 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 22px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h2 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 16px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    h3 {\n      margin-top: 0;\n      color: #333333;\n      font-size: 14px;\n      font-weight: bold;\n      text-align: left;\n    }\n    \n    td,\n    th {\n      font-size: 16px;\n    }\n    \n    p,\n    ul,\n    ol,\n    blockquote {\n      margin: .4em 0 1.1875em;\n      font-size: 16px;\n      line-height: 1.625;\n    }\n    \n    p.sub {\n      font-size: 13px;\n    }\n    /* Utilities ------------------------------ */\n    \n    .align-right {\n      text-align: right;\n    }\n    \n    .align-left {\n      text-align: left;\n    }\n    \n    .align-center {\n      text-align: center;\n    }\n    \n    .u-margin-bottom-none {\n      margin-bottom: 0;\n    }\n    /* Buttons ------------------------------ */\n    \n    .button {\n      background-color: #3869D4;\n      border-top: 10px solid #3869D4;\n      border-right: 18px solid #3869D4;\n      border-bottom: 10px solid #3869D4;\n      border-left: 18px solid #3869D4;\n      display: inline-block;\n      color: #FFF;\n      text-decoration: none;\n      border-radius: 3px;\n      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);\n      -webkit-text-size-adjust: none;\n      box-sizing: border-box;\n    }\n    \n    .button--green {\n      background-color: #22BC66;\n      border-top: 10px solid #22BC66;\n      border-right: 18px solid #22BC66;\n      border-bottom: 10px solid #22BC66;\n      border-left: 18px solid #22BC66;\n    }\n    \n    .button--red {\n      background-color: #FF6136;\n      border-top: 10px solid #FF6136;\n      border-right: 18px solid #FF6136;\n      border-bottom: 10px solid #FF6136;\n      border-left: 18px solid #FF6136;\n    }\n    \n    @media only screen and (max-width: 500px) {\n      .button {\n        width: 100% !important;\n        text-align: center !important;\n      }\n    }\n    /* Attribute list ------------------------------ */\n    \n    .attributes {\n      margin: 0 0 21px;\n    }\n    \n    .attributes_content {\n      background-color: #F4F4F7;\n      padding: 16px;\n    }\n    \n    .attributes_item {\n      padding: 0;\n    }\n    /* Related Items ------------------------------ */\n    \n    .related {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .related_item {\n      padding: 10px 0;\n      color: #CBCCCF;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .related_item-title {\n      display: block;\n      margin: .5em 0 0;\n    }\n    \n    .related_item-thumb {\n      display: block;\n      padding-bottom: 10px;\n    }\n    \n    .related_heading {\n      border-top: 1px solid #CBCCCF;\n      text-align: center;\n      padding: 25px 0 10px;\n    }\n    /* Discount Code ------------------------------ */\n    \n    .discount {\n      width: 100%;\n      margin: 0;\n      padding: 24px;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n      border: 2px dashed #CBCCCF;\n    }\n    \n    .discount_heading {\n      text-align: center;\n    }\n    \n    .discount_body {\n      text-align: center;\n      font-size: 15px;\n    }\n    /* Social Icons ------------------------------ */\n    \n    .social {\n      width: auto;\n    }\n    \n    .social td {\n      padding: 0;\n      width: auto;\n    }\n    \n    .social_icon {\n      height: 20px;\n      margin: 0 8px 10px 8px;\n      padding: 0;\n    }\n    /* Data table ------------------------------ */\n    \n    .purchase {\n      width: 100%;\n      margin: 0;\n      padding: 35px 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_content {\n      width: 100%;\n      margin: 0;\n      padding: 25px 0 0 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    \n    .purchase_item {\n      padding: 10px 0;\n      color: #51545E;\n      font-size: 15px;\n      line-height: 18px;\n    }\n    \n    .purchase_heading {\n      padding-bottom: 8px;\n      border-bottom: 1px solid #EAEAEC;\n    }\n    \n    .purchase_heading p {\n      margin: 0;\n      color: #85878E;\n      font-size: 12px;\n    }\n    \n    .purchase_footer {\n      padding-top: 15px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .purchase_total {\n      margin: 0;\n      text-align: right;\n      font-weight: bold;\n      color: #333333;\n    }\n    \n    .purchase_total--label {\n      padding: 0 15px 0 0;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    \n    p {\n      color: #51545E;\n    }\n    \n    p.sub {\n      color: #6B6E76;\n    }\n    \n    .email-wrapper {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #F4F4F7;\n    }\n    \n    .email-content {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n    }\n    /* Masthead ----------------------- */\n    \n    .email-masthead {\n      padding: 25px 0;\n      text-align: center;\n    }\n    \n    .email-masthead_logo {\n      width: 94px;\n    }\n    \n    .email-masthead_name {\n      font-size: 16px;\n      font-weight: bold;\n      color: #A8AAAF;\n      text-decoration: none;\n      text-shadow: 0 1px 0 white;\n    }\n    /* Body ------------------------------ */\n    \n    .email-body {\n      width: 100%;\n      margin: 0;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFF;\n      border: solid white;\n      border-width: 1px 0px;\n      border-color: var(--my-border-color)\n      \n    }\n\n    .table-border-color {\n      border-color: var(--my-border-color)\n    }\n    \n    .email-body_inner {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      background-color: #FFFFFF;\n    }\n    \n    .email-footer {\n      width: 570px;\n      margin: 0 auto;\n      padding: 0;\n      -premailer-width: 570px;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .email-footer p {\n      color: #6B6E76;\n    }\n    \n    .body-action {\n      width: 100%;\n      margin: 30px auto;\n      padding: 0;\n      -premailer-width: 100%;\n      -premailer-cellpadding: 0;\n      -premailer-cellspacing: 0;\n      text-align: center;\n    }\n    \n    .body-sub {\n      margin-top: 25px;\n      padding-top: 25px;\n      border-top: 1px solid #EAEAEC;\n    }\n    \n    .content-cell {\n      padding: 35px;\n    }\n\n    .table-test {\n      border: 1px solid; border-radius: 0.5rem; border-color: #00000020;\n    }\n\n    /*Media Queries ------------------------------ */\n    \n    @media only screen and (max-width: 600px) {\n      .email-body_inner,\n      .email-footer {\n        width: 100% !important;\n      }\n    }\n    \n    @media (prefers-color-scheme: dark) {\n      body,\n      .email-body,\n      .email-body_inner {\n        background-color: #000 !important;\n        color: #FFF !important;\n      }\n\n      :root {\n        --my-border-color: #FFFFFF60;\n      }\n\n      .table-border-color {\n        border-color: #FFFFFF60\n      }\n\n      .table-test {\n        border: 1px solid; border-radius: 0.5rem; border-color: #FFFFFF60;\n      }\n\n      .email-body {\n        border-color: #FFFFFF60\n      }\n\n      .email-content,\n      .email-masthead,\n      .email-wrapper,\n      .email-footer {\n        background-color: #333333;\n      }\n\n      p,\n      ul,\n      ol,\n      blockquote,\n      span,\n      .purchase_item {\n        color: #C0C0C0E0 !important;\n      }\n\n      h1,\n      h2,\n      h3 {\n        color: #FFF !important;\n      }\n\n      .attributes_content,\n      .discount {\n        background-color: #222 !important;\n      }\n      .email-masthead_name {\n        text-shadow: none !important;\n      }\n    }\n    \n    :root {\n      --my-border-color: #00000020;\n      color-scheme: light dark;\n      supported-color-schemes: light dark;\n    }\n    </style>\n    <!--[if mso]>\n    <style type=\"text/css\">\n      .f-fallback  {\n        font-family: Arial, sans-serif;\n      }\n    </style>\n  <![endif]-->\n    <style type=\"text/css\" rel=\"stylesheet\" media=\"all\">\n    body {\n      width: 100% !important;\n      height: 100%;\n      margin: 0;\n      -webkit-text-size-adjust: none;\n    }\n    \n    body {\n      font-family: \"Nunito Sans\", Helvetica, Arial, sans-serif;\n    }\n    \n    body {\n      background-color: #F4F4F7;\n      color: #51545E;\n    }\n    </style>\n  </head>\n  <body style=\"width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;\" bgcolor=\"#F4F4F7\">\n    <table class=\"email-wrapper\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;\" bgcolor=\"#F4F4F7\">\n      <tr>\n        <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n          <table class=\"email-content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;\">\n            <tr>\n              <td class=\"email-masthead\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;\" align=\"center\">\n                <a href=\"{{info.general_store_website}}\" class=\"f-fallback email-masthead_name\" style=\"color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;\">\n                {{info.general_store_name}}\n              </a>\n              </td>\n            </tr>\n            <!-- Email Body -->\n            <tr>\n              <td class=\"email-body\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;\" bgcolor=\"#FFFFFF\">\n                <table class=\"email-body_inner\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;\" bgcolor=\"#FFFFFF\">\n                  <!-- Body content -->\n                  <tr>\n                    <td class=\"content-cell\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 32px 8px;\">\n                      <div class=\"f-fallback\">\n                        <h1 style=\"margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;\" align=\"left\">Hi {{order.contact.firstname}},</h1>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\" >Thank you for your purchase. This email is the receipt for your purchase.</p>\n                        <table class=\"purchase\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0px 0;\">\n                          <tr>\n                            <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <h3 style=\"margin-top: 0; color: #333333; font-size: 14px; font-weight: bold; text-align: left;\" align=\"left\">{{order.id}}</h3></td>\n                            \n                          </tr>\n                          <tr class=\"attributes_content\" >\n                            <td colspan=\"2\" class=\"table-test\"  style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 1rem\" >\n                              <table class=\"purchase_content\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0 0;\">\n                                <tr>\n                                  <th class=\"purchase_heading table-border-color\" align=\"left\" style=\"font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-bottom: 8px; border-bottom-width: 1px;  border-bottom-style: solid;\">\n                                    <p class=\"f-fallback\" style=\"font-size: 12px; line-height: 1.625; color: #85878E; margin: 0;\">Description</p>\n                                  </th>\n                                  <th class=\"purchase_heading table-border-color\" align=\"right\" style=\"font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-bottom: 8px; border-bottom-width: 1px; border-bottom-style: solid;\">\n                                    <p class=\"f-fallback\" style=\"font-size: 12px; line-height: 1.625; color: #85878E; margin: 0;\">Amount</p>\n                                  </th>\n                                </tr>\n                                {{#each order.line_items}}\n                                <tr>\n                                  <td width=\"80%\" class=\"purchase_item\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 15px; color: #51545E; line-height: 18px; padding: 10px 0;\"><span class=\"f-fallback\">{{data.title}}</span></td>\n                                  <td class=\"align-right\" width=\"20%\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: right;\" align=\"right\"><span class=\"f-fallback\">{{qty}}</span></td>\n                                </tr>\n                                {{/each}}\n                                <tr>\n                                  <td width=\"80%\" class=\"purchase_footer table-border-color\" valign=\"middle\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-style: solid;\">\n                                    <p class=\"f-fallback purchase_total purchase_total--label\" style=\"font-size: 14px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0; padding: 0 15px 0 0;\" align=\"right\">Shipping</p>\n                                  </td>\n                                  <td width=\"20%\" class=\"purchase_footer table-border-color\" valign=\"middle\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-style: solid;\">\n                                    <p class=\"f-fallback purchase_total\" style=\"font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0;\" align=\"right\">{{order.shipping_method.price}}</p>\n                                  </td>\n                                </tr>\n                                <tr>\n                                  <td width=\"80%\" class=\"purchase_footer table-border-color\" valign=\"middle\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-style: solid;\">\n                                    <p class=\"f-fallback purchase_total purchase_total--label\" style=\"font-size: 14px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0; padding: 0 15px 0 0;\" align=\"right\">Subtotal Discounts</p>\n                                  </td>\n                                  <td width=\"20%\" class=\"purchase_footer table-border-color\" valign=\"middle\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-style: solid;\">\n                                    <p class=\"f-fallback purchase_total\" style=\"font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0;\" align=\"right\">-{{order.pricing.subtotal_discount}}</p>\n                                  </td>\n                                </tr>\n                                <tr>\n                                  <td width=\"80%\" class=\"purchase_footer table-border-color\" valign=\"middle\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px;border-top-style: solid;\">\n                                    <p class=\"f-fallback purchase_total purchase_total--label\" style=\"font-size: 14px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0; padding: 0 15px 0 0;\" align=\"right\">Total</p>\n                                  </td>\n                                  <td width=\"20%\" class=\"purchase_footer table-border-color\" valign=\"middle\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-style: solid;\">\n                                    <p class=\"f-fallback purchase_total\" style=\"font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0;\" align=\"right\">{{order.pricing.total}}</p>\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">If you have any questions about this receipt, simply reply to this email or reach out to our <a href=\"mailto:{{info.general_store_support_email}}\" style=\"color: #3869D4;\">support team</a> for help.</p>\n                        <p style=\"font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;\">Cheers,\n                          <br />The {{info.general_store_name}} team</p>\n                        <!-- Action -->\n                        <table class=\"body-action\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 30px auto; padding: 0;\">\n                          <tr>\n                            <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                              <!-- Border based button\n           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->\n                              <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" role=\"presentation\">\n                                <tr>\n                                  <td align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                                    {{!-- <a href=\"{{action_url}}\" class=\"f-fallback button button--blue\" target=\"_blank\" style=\"color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;\">Download as PDF</a> --}}\n                                  </td>\n                                </tr>\n                              </table>\n                            </td>\n                          </tr>\n                        </table>\n                        <!-- Sub copy -->\n                        \n                      </div>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n            <tr>\n              <td style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;\">\n                <table class=\"email-footer\" align=\"center\" width=\"570\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;\">\n                  <tr>\n                    <td class=\"content-cell\" align=\"center\" style=\"word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;\">\n                      <p class=\"f-fallback sub align-center\" style=\"font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;\" align=\"center\">\n                        {{info.general_store_name}}                       \n                      </p>\n                    </td>\n                  </tr>\n                </table>\n              </td>\n            </tr>\n          </table>\n        </td>\n      </tr>\n    </table>\n  </body>\n</html>"),
    "template_text": base64_encode("[{{info.general_store_name}}] ({{info.general_store_website}})\n\n************\nHi {{order.contact.firstname}},\n************\n\nThank you for your purchase !!!\n\n\nOrder ID is {{order.id}}\n--------------\n\nDescription\n\nItems\n{{#each order.line_items}}\n- {{data.title}} x {{qty}}\n{{/each}}\n\nShipping \n{{order.shipping_method.title}}, {{order.shipping_method.price}}\n\nDiscounts\n{{#each order.pricing.evo}}\n- {{discount.title}} - {{total_discount}}\n{{/each}}\n\nTotal\n{{order.pricing.total}}\n\nIf you have any questions about this receipt, simply reply to this \nemail or reach out to our support team ( {{ info.general_store_support_email }} ) for help.\n\nCheers,\nThe {{info.general_store_name}} team\n\n\n{{info.general_store_name}}\n{{info.general_store_website}}"),
    "reference_example_input": {
        "order": {
            "contact": {
                "email": "john@doe.com",
                "firstname": "John",
                "phone_number": "000-000-000",
                "customer_id": "cus_65f2ae6e8bf30e6cd0ca95fa"
            },
            "address": {},
            "status": {
                "checkout": {
                    "id": 0,
                    "name2": "created",
                    "name": "Created"
                },
                "payment": {
                    "id": 1,
                    "name": "Authorized",
                    "name2": "authorized"
                },
                "fulfillment": {
                    "id": 0,
                    "name2": "draft",
                    "name": "Draft"
                }
            },
            "pricing": {
                "evo": [
                    {
                        "quantity_discounted": 0,
                        "quantity_undiscounted": 11,
                        "subtotal": 1100,
                        "total": 1150
                    },
                    {
                        "quantity_discounted": 2,
                        "total_discount": 100,
                        "quantity_undiscounted": 9,
                        "discount": {
                            "active": true,
                            "handle": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
                            "title": "50% OFF Bundle: robot arms and legs (not recursive)",
                            "priority": 0,
                            "application": {
                                "id": 0,
                                "name": "Automatic",
                                "name2": "automatic"
                            },
                            "info": {
                                "details": {
                                    "meta": {
                                        "id": 4,
                                        "type": "bundle",
                                        "name": "Bundle Discount"
                                    },
                                    "extra": {
                                        "fixed": 0,
                                        "percent": 50,
                                        "recursive": false
                                    }
                                },
                                "filters": [
                                    {
                                        "meta": {
                                            "id": 4,
                                            "type": "product",
                                            "op": "p-in-tags",
                                            "name": "Product has Tag"
                                        },
                                        "value": [
                                            "robot_arm"
                                        ]
                                    },
                                    {
                                        "meta": {
                                            "id": 4,
                                            "type": "product",
                                            "op": "p-in-tags",
                                            "name": "Product has Tag"
                                        },
                                        "value": [
                                            "robot_leg"
                                        ]
                                    }
                                ]
                            }
                        },
                        "discount_code": "discount-bundle-50-off-robot-arms-and-legs-not-recursive",
                        "subtotal": 1000,
                        "total": 1050
                    }
                ],
                "shipping_method": {
                    "title": "",
                    "handle": "",
                    "price": 50
                },
                "subtotal_discount": 100,
                "subtotal_undiscounted": 1100,
                "subtotal": 1000,
                "total": 1050,
                "quantity_total": 11,
                "quantity_discounted": 2,
                "errors": []
            },
            "line_items": [
                {
                    "id": "robot-leg-white",
                    "qty": 3,
                    "data": {
                        "tags": [
                            "robot_leg"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Leg White",
                        "price": 100
                    }
                },
                {
                    "id": "battery",
                    "qty": 5,
                    "data": {
                        "tags": [
                            "would-not-be-discounted"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Battery",
                        "price": 100
                    }
                },
                {
                    "id": "robot-arm-red",
                    "qty": 2,
                    "data": {
                        "tags": [
                            "robot_arm"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Arm Red",
                        "price": 100
                    }
                },
                {
                    "id": "robot-arm-green",
                    "qty": 1,
                    "data": {
                        "tags": [
                            "robot_arm"
                        ],
                        "qty": 100,
                        "active": true,
                        "title": "Robot Arm Green",
                        "price": 100
                    }
                }
            ],
            "shipping_method": {
                "handle": "ship-fast",
                "title": "ship fast",
                "price": 50
            },
            "id": "order_65d774c6445e4581b9e34c11",
            "created_at": "2024-02-22T16:22:30.095Z",
            "updated_at": "2024-02-22T16:22:30.095Z"
        },
        "info": {
            "general_store_name": "Wush Wush Games",
            "general_store_website": "https://wush.games/",
            "general_store_description": "We sell retro video games",
            "general_confirm_email_base_url": "https://wush.games/confirm-email",
            "general_store_support_email": "support@wush.games"
        }
    },
    "handle": "checkout-complete",
    "id": "template_664b15174eba71b9ee185be5",
    "created_at": "2024-05-20T09:17:11.255Z",
    "updated_at": "2024-10-02T09:48:01.230Z",
    "search": [
        "handle:checkout-complete",
        "checkout-complete",
        "id:template_664b15174eba71b9ee185be5",
        "template_664b15174eba71b9ee185be5",
        "664b15174eba71b9ee185be5",
        "checkout",
        "complete",
        "checkout complete"
    ]
  }

]