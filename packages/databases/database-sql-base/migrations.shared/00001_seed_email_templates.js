import { Kysely } from 'kysely'
import { upsert } from '../src/con.templates.js'
import { base64 } from '@storecraft/core/v-crypto';

/**
 * @typedef {import('../types.sql.tables.js').Database} Database
 */

/**
 * 
 * @param {string} val 
 */
const base64_encode = val => {
  return 'base64_' + base64.encode(val);
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function up(db) {
  
  for (const template of templates.slice(0)) {
    const result = await upsert(db)(template);
    if(!result)
      throw new Error('Failed to write a template object')
  }
}

/**
 * 
 * @param {Kysely<Database>} db 
 */
export async function down(db) {
}


const templates = [
  {
    "title": "Welcome Customer",
    "template_html": base64_encode(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml" style="color-scheme: light dark; supported-color-schemes: light dark;">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
    /* Base ------------------------------ */
    
    @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap");
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
    }
    
    a {
      color: #3869D4;
    }
    
    a img {
      border: none;
    }
    
    td {
      word-break: break-word;
    }
    
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    /* Type ------------------------------ */
    
    body,
    td,
    th {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }
    
    h1 {
      margin-top: 0;
      color: #333333;
      font-size: 22px;
      font-weight: bold;
      text-align: left;
    }
    
    h2 {
      margin-top: 0;
      color: #333333;
      font-size: 16px;
      font-weight: bold;
      text-align: left;
    }
    
    h3 {
      margin-top: 0;
      color: #333333;
      font-size: 14px;
      font-weight: bold;
      text-align: left;
    }
    
    td,
    th {
      font-size: 16px;
    }
    
    p,
    ul,
    ol,
    blockquote {
      margin: .4em 0 1.1875em;
      font-size: 16px;
      line-height: 1.625;
    }
    
    p.sub {
      font-size: 13px;
    }
    /* Utilities ------------------------------ */
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .align-center {
      text-align: center;
    }
    
    .u-margin-bottom-none {
      margin-bottom: 0;
    }
    /* Buttons ------------------------------ */
    
    .button {
      background-color: #3869D4;
      border-top: 10px solid #3869D4;
      border-right: 18px solid #3869D4;
      border-bottom: 10px solid #3869D4;
      border-left: 18px solid #3869D4;
      display: inline-block;
      color: #FFF;
      text-decoration: none;
      border-radius: 3px;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
      -webkit-text-size-adjust: none;
      box-sizing: border-box;
    }
    
    .button--green {
      background-color: #22BC66;
      border-top: 10px solid #22BC66;
      border-right: 18px solid #22BC66;
      border-bottom: 10px solid #22BC66;
      border-left: 18px solid #22BC66;
    }
    
    .button--red {
      background-color: #FF6136;
      border-top: 10px solid #FF6136;
      border-right: 18px solid #FF6136;
      border-bottom: 10px solid #FF6136;
      border-left: 18px solid #FF6136;
    }
    
    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
        text-align: center !important;
      }
    }
    /* Attribute list ------------------------------ */
    
    .attributes {
      margin: 0 0 21px;
    }
    
    .attributes_content {
      background-color: #F4F4F7;
      padding: 16px;
    }
    
    .attributes_item {
      padding: 0;
    }
    /* Related Items ------------------------------ */
    
    .related {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .related_item {
      padding: 10px 0;
      color: #CBCCCF;
      font-size: 15px;
      line-height: 18px;
    }
    
    .related_item-title {
      display: block;
      margin: .5em 0 0;
    }
    
    .related_item-thumb {
      display: block;
      padding-bottom: 10px;
    }
    
    .related_heading {
      border-top: 1px solid #CBCCCF;
      text-align: center;
      padding: 25px 0 10px;
    }
    /* Discount Code ------------------------------ */
    
    .discount {
      width: 100%;
      margin: 0;
      padding: 24px;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F4F4F7;
      border: 2px dashed #CBCCCF;
    }
    
    .discount_heading {
      text-align: center;
    }
    
    .discount_body {
      text-align: center;
      font-size: 15px;
    }
    /* Social Icons ------------------------------ */
    
    .social {
      width: auto;
    }
    
    .social td {
      padding: 0;
      width: auto;
    }
    
    .social_icon {
      height: 20px;
      margin: 0 8px 10px 8px;
      padding: 0;
    }
    /* Data table ------------------------------ */
    
    .purchase {
      width: 100%;
      margin: 0;
      padding: 35px 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_content {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_item {
      padding: 10px 0;
      color: #51545E;
      font-size: 15px;
      line-height: 18px;
    }
    
    .purchase_heading {
      padding-bottom: 8px;
      border-bottom: 1px solid #EAEAEC;
    }
    
    .purchase_heading p {
      margin: 0;
      color: #85878E;
      font-size: 12px;
    }
    
    .purchase_footer {
      padding-top: 15px;
      border-top: 1px solid #EAEAEC;
    }
    
    .purchase_total {
      margin: 0;
      text-align: right;
      font-weight: bold;
      color: #333333;
    }
    
    .purchase_total--label {
      padding: 0 15px 0 0;
    }
    
    body {
      background-color: #F4F4F7;
      color: #51545E;
    }
    
    p {
      color: #51545E;
    }
    
    p.sub {
      color: #6B6E76;
    }
    
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F4F4F7;
    }
    
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    /* Masthead ----------------------- */
    
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    
    .email-masthead_logo {
      width: 94px;
    }
    
    .email-masthead_name {
      font-size: 16px;
      font-weight: bold;
      color: #A8AAAF;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }
    /* Body ------------------------------ */
    
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .email-footer p {
      color: #6B6E76;
    }
    
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EAEAEC;
    }
    
    .content-cell {
      padding: 35px;
    }
    /*Media Queries ------------------------------ */
    
    @media only screen and (max-width: 600px) {
      .email-body_inner,
      .email-footer {
        width: 100% !important;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      body,
      .email-body,
      .email-body_inner,
      .email-content,
      .email-wrapper,
      .email-masthead,
      .email-footer {
        background-color: #333333 !important;
        color: #FFF !important;
      }
      p,
      ul,
      ol,
      blockquote,
      h1,
      h2,
      h3,
      span,
      .purchase_item {
        color: #FFF !important;
      }
      .attributes_content,
      .discount {
        background-color: #222 !important;
      }
      .email-masthead_name {
        text-shadow: none !important;
      }
    }
    
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
    <style type="text/css" rel="stylesheet" media="all">
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
    }
    
    body {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }
    
    body {
      background-color: #F4F4F7;
      color: #51545E;
    }
    </style>
  </head>
  <body style="width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;" bgcolor="#F4F4F7">
    <span class="preheader" style="display: none !important; visibility: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden;">Thanks for signing up with us. We’re thrilled to have you on board.</span>
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;" bgcolor="#F4F4F7">
      <tr>
        <td align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;">
            <tr>
              <td class="email-masthead" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;" align="center">
                <a href="{{info.general_store_website}}" class="f-fallback email-masthead_name" style="color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;">
                {{info.general_store_name}}
              </a>
              </td>
            </tr>
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;" bgcolor="#FFFFFF">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;" bgcolor="#FFFFFF">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;">
                      <div class="f-fallback">
                        <h1 style="margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;" align="left">Welcome, {{customer.firstname}}!</h1>
                        <p style="font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;">Thanks for signing up with us. We’re thrilled to have you on board.</p>
                        <!-- Action -->
                        <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 30px auto; padding: 0;">
                          <tr>
                            <td align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                              <!-- Border based button
           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                <tr>
                                  <td align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                                    {{!-- <a href="{{info.general_confirm_email_base_url}}/user={{customer.id}}" class="f-fallback button" target="_blank" style="color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;">Confirm your email</a> --}}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;">For reference, here's your login information:</p>
                        <table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 0 21px;">
                          <tr>
                            <td class="attributes_content" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; background-color: #F4F4F7; padding: 16px;" bgcolor="#F4F4F7">
                              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                  <td class="attributes_item" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;">
                                    <span class="f-fallback">
              <strong>User ID:</strong> {{customer.id}}
            </span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;">Need help, or have any questions ? Simply reply to this email, we'd love to help</p>
                        <!-- Sub copy -->
                        
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;">
                  <tr>
                    <td class="content-cell" align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;">
                      <p class="f-fallback sub align-center" style="font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;" align="center">
                        {{info.general_store_name}}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`),
    "template_text": base64_encode("Thanks for signing up with us. \nWe’re thrilled to have you on board.\n\n******************\nWelcome, {{customer.firstname}}!\n******************\n\nThanks for signing up with us. We’re thrilled to \nhave you on board.\n\nConfirm your email here: \n{{ info.general_confirm_email_base_url }}/user={{customer.id}}\n\nFor reference, here's your login information:\n\nUser ID: {{customer.id}}\n\nNeed help, or have any questions ?\nSimply reply to this email, we'd love to help\n\n[{{info.general_store_name}}] ({{info.general_store_website}})\n"),
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
      }
    },
    "handle": "welcome-customer",
    "id": "template_664afed24eba71b9ee185be4",
    "created_at": "2024-05-20T07:42:10.436Z",
    "updated_at": "2024-05-20T09:39:46.492Z",
    "_relations": {
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
    }
  },
  {
    "title": "Checkout Complete",
    "template_html": base64_encode(`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns="http://www.w3.org/1999/xhtml" style="color-scheme: light dark; supported-color-schemes: light dark;">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title></title>
    <style type="text/css" rel="stylesheet" media="all">
    /* Base ------------------------------ */
    
    @import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&amp;display=swap");
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
    }
    
    a {
      color: #3869D4;
    }
    
    a img {
      border: none;
    }
    
    td {
      word-break: break-word;
    }
    
    .preheader {
      display: none !important;
      visibility: hidden;
      mso-hide: all;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      opacity: 0;
      overflow: hidden;
    }
    /* Type ------------------------------ */
    
    body,
    td,
    th {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }
    
    h1 {
      margin-top: 0;
      color: #333333;
      font-size: 22px;
      font-weight: bold;
      text-align: left;
    }
    
    h2 {
      margin-top: 0;
      color: #333333;
      font-size: 16px;
      font-weight: bold;
      text-align: left;
    }
    
    h3 {
      margin-top: 0;
      color: #333333;
      font-size: 14px;
      font-weight: bold;
      text-align: left;
    }
    
    td,
    th {
      font-size: 16px;
    }
    
    p,
    ul,
    ol,
    blockquote {
      margin: .4em 0 1.1875em;
      font-size: 16px;
      line-height: 1.625;
    }
    
    p.sub {
      font-size: 13px;
    }
    /* Utilities ------------------------------ */
    
    .align-right {
      text-align: right;
    }
    
    .align-left {
      text-align: left;
    }
    
    .align-center {
      text-align: center;
    }
    
    .u-margin-bottom-none {
      margin-bottom: 0;
    }
    /* Buttons ------------------------------ */
    
    .button {
      background-color: #3869D4;
      border-top: 10px solid #3869D4;
      border-right: 18px solid #3869D4;
      border-bottom: 10px solid #3869D4;
      border-left: 18px solid #3869D4;
      display: inline-block;
      color: #FFF;
      text-decoration: none;
      border-radius: 3px;
      box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
      -webkit-text-size-adjust: none;
      box-sizing: border-box;
    }
    
    .button--green {
      background-color: #22BC66;
      border-top: 10px solid #22BC66;
      border-right: 18px solid #22BC66;
      border-bottom: 10px solid #22BC66;
      border-left: 18px solid #22BC66;
    }
    
    .button--red {
      background-color: #FF6136;
      border-top: 10px solid #FF6136;
      border-right: 18px solid #FF6136;
      border-bottom: 10px solid #FF6136;
      border-left: 18px solid #FF6136;
    }
    
    @media only screen and (max-width: 500px) {
      .button {
        width: 100% !important;
        text-align: center !important;
      }
    }
    /* Attribute list ------------------------------ */
    
    .attributes {
      margin: 0 0 21px;
    }
    
    .attributes_content {
      background-color: #F4F4F7;
      padding: 16px;
    }
    
    .attributes_item {
      padding: 0;
    }
    /* Related Items ------------------------------ */
    
    .related {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .related_item {
      padding: 10px 0;
      color: #CBCCCF;
      font-size: 15px;
      line-height: 18px;
    }
    
    .related_item-title {
      display: block;
      margin: .5em 0 0;
    }
    
    .related_item-thumb {
      display: block;
      padding-bottom: 10px;
    }
    
    .related_heading {
      border-top: 1px solid #CBCCCF;
      text-align: center;
      padding: 25px 0 10px;
    }
    /* Discount Code ------------------------------ */
    
    .discount {
      width: 100%;
      margin: 0;
      padding: 24px;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F4F4F7;
      border: 2px dashed #CBCCCF;
    }
    
    .discount_heading {
      text-align: center;
    }
    
    .discount_body {
      text-align: center;
      font-size: 15px;
    }
    /* Social Icons ------------------------------ */
    
    .social {
      width: auto;
    }
    
    .social td {
      padding: 0;
      width: auto;
    }
    
    .social_icon {
      height: 20px;
      margin: 0 8px 10px 8px;
      padding: 0;
    }
    /* Data table ------------------------------ */
    
    .purchase {
      width: 100%;
      margin: 0;
      padding: 35px 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_content {
      width: 100%;
      margin: 0;
      padding: 25px 0 0 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    
    .purchase_item {
      padding: 10px 0;
      color: #51545E;
      font-size: 15px;
      line-height: 18px;
    }
    
    .purchase_heading {
      padding-bottom: 8px;
      border-bottom: 1px solid #EAEAEC;
    }
    
    .purchase_heading p {
      margin: 0;
      color: #85878E;
      font-size: 12px;
    }
    
    .purchase_footer {
      padding-top: 15px;
      border-top: 1px solid #EAEAEC;
    }
    
    .purchase_total {
      margin: 0;
      text-align: right;
      font-weight: bold;
      color: #333333;
    }
    
    .purchase_total--label {
      padding: 0 15px 0 0;
    }
    
    body {
      background-color: #F4F4F7;
      color: #51545E;
    }
    
    p {
      color: #51545E;
    }
    
    p.sub {
      color: #6B6E76;
    }
    
    .email-wrapper {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #F4F4F7;
    }
    
    .email-content {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
    }
    /* Masthead ----------------------- */
    
    .email-masthead {
      padding: 25px 0;
      text-align: center;
    }
    
    .email-masthead_logo {
      width: 94px;
    }
    
    .email-masthead_name {
      font-size: 16px;
      font-weight: bold;
      color: #A8AAAF;
      text-decoration: none;
      text-shadow: 0 1px 0 white;
    }
    /* Body ------------------------------ */
    
    .email-body {
      width: 100%;
      margin: 0;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-body_inner {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      background-color: #FFFFFF;
    }
    
    .email-footer {
      width: 570px;
      margin: 0 auto;
      padding: 0;
      -premailer-width: 570px;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .email-footer p {
      color: #6B6E76;
    }
    
    .body-action {
      width: 100%;
      margin: 30px auto;
      padding: 0;
      -premailer-width: 100%;
      -premailer-cellpadding: 0;
      -premailer-cellspacing: 0;
      text-align: center;
    }
    
    .body-sub {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid #EAEAEC;
    }
    
    .content-cell {
      padding: 35px;
    }
    /*Media Queries ------------------------------ */
    
    @media only screen and (max-width: 600px) {
      .email-body_inner,
      .email-footer {
        width: 100% !important;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      body,
      .email-body,
      .email-body_inner,
      .email-content,
      .email-wrapper,
      .email-masthead,
      .email-footer {
        background-color: #333333 !important;
        color: #FFF !important;
      }
      p,
      ul,
      ol,
      blockquote,
      h1,
      h2,
      h3,
      span,
      .purchase_item {
        color: #FFF !important;
      }
      .attributes_content,
      .discount {
        background-color: #222 !important;
      }
      .email-masthead_name {
        text-shadow: none !important;
      }
    }
    
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    </style>
    <!--[if mso]>
    <style type="text/css">
      .f-fallback  {
        font-family: Arial, sans-serif;
      }
    </style>
  <![endif]-->
    <style type="text/css" rel="stylesheet" media="all">
    body {
      width: 100% !important;
      height: 100%;
      margin: 0;
      -webkit-text-size-adjust: none;
    }
    
    body {
      font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
    }
    
    body {
      background-color: #F4F4F7;
      color: #51545E;
    }
    </style>
  </head>
  <body style="width: 100% !important; height: 100%; -webkit-text-size-adjust: none; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; background-color: #F4F4F7; color: #51545E; margin: 0;" bgcolor="#F4F4F7">
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #F4F4F7; margin: 0; padding: 0;" bgcolor="#F4F4F7">
      <tr>
        <td align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
          <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0;">
            <tr>
              <td class="email-masthead" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: center; padding: 25px 0;" align="center">
                <a href="{{info.general_store_website}}" class="f-fallback email-masthead_name" style="color: #A8AAAF; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;">
                {{info.general_store_name}}
              </a>
              </td>
            </tr>
            <!-- Email Body -->
            <tr>
              <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0; padding: 0;" bgcolor="#FFFFFF">
                <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #FFFFFF; margin: 0 auto; padding: 0;" bgcolor="#FFFFFF">
                  <!-- Body content -->
                  <tr>
                    <td class="content-cell" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;">
                      <div class="f-fallback">
                        <h1 style="margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;" align="left">Hi {{order.contact.firstname}},</h1>
                        <p style="font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;">Thank you for your purchase. This email is the receipt for your purchase.</p>
                        <table class="purchase" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 0px 0;">
                          <tr>
                            <td style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                              <h3 style="margin-top: 0; color: #333333; font-size: 14px; font-weight: bold; text-align: left;" align="left">{{order.id}}</h3></td>
                            
                          </tr>
                          <tr>
                            <td colspan="2" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                              <table class="purchase_content" width="100%" cellpadding="0" cellspacing="0" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; margin: 0; padding: 25px 0 0;">
                                <tr>
                                  <th class="purchase_heading" align="left" style="font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-bottom: 8px; border-bottom-width: 1px; border-bottom-color: #EAEAEC; border-bottom-style: solid;">
                                    <p class="f-fallback" style="font-size: 12px; line-height: 1.625; color: #85878E; margin: 0;">Description</p>
                                  </th>
                                  <th class="purchase_heading" align="right" style="font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-bottom: 8px; border-bottom-width: 1px; border-bottom-color: #EAEAEC; border-bottom-style: solid;">
                                    <p class="f-fallback" style="font-size: 12px; line-height: 1.625; color: #85878E; margin: 0;">Amount</p>
                                  </th>
                                </tr>
                                {{#each order.line_items}}
                                <tr>
                                  <td width="80%" class="purchase_item" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 15px; color: #51545E; line-height: 18px; padding: 10px 0;"><span class="f-fallback">{{data.title}}</span></td>
                                  <td class="align-right" width="20%" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; text-align: right;" align="right"><span class="f-fallback">{{qty}}</span></td>
                                </tr>
                                {{/each}}
                                <tr>
                                  <td width="80%" class="purchase_footer" valign="middle" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-color: #EAEAEC; border-top-style: solid;">
                                    <p class="f-fallback purchase_total purchase_total--label" style="font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0; padding: 0 15px 0 0;" align="right">Shipping</p>
                                  </td>
                                  <td width="20%" class="purchase_footer" valign="middle" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-color: #EAEAEC; border-top-style: solid;">
                                    <p class="f-fallback purchase_total" style="font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0;" align="right">{{order.shipping_method.price}}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td width="80%" class="purchase_footer" valign="middle" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-color: #EAEAEC; border-top-style: solid;">
                                    <p class="f-fallback purchase_total purchase_total--label" style="font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0; padding: 0 15px 0 0;" align="right">Subtotal Discounts</p>
                                  </td>
                                  <td width="20%" class="purchase_footer" valign="middle" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-color: #EAEAEC; border-top-style: solid;">
                                    <p class="f-fallback purchase_total" style="font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0;" align="right">-{{order.pricing.subtotal_discount}}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td width="80%" class="purchase_footer" valign="middle" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-color: #EAEAEC; border-top-style: solid;">
                                    <p class="f-fallback purchase_total purchase_total--label" style="font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0; padding: 0 15px 0 0;" align="right">Total</p>
                                  </td>
                                  <td width="20%" class="purchase_footer" valign="middle" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding-top: 15px; border-top-width: 1px; border-top-color: #EAEAEC; border-top-style: solid;">
                                    <p class="f-fallback purchase_total" style="font-size: 16px; line-height: 1.625; text-align: right; font-weight: bold; color: #333333; margin: 0;" align="right">{{order.pricing.total}}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <p style="font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;">If you have any questions about this receipt, simply reply to this email or reach out to our <a href="mailto:{{info.general_store_support_email}}" style="color: #3869D4;">support team</a> for help.</p>
                        <p style="font-size: 16px; line-height: 1.625; color: #51545E; margin: .4em 0 1.1875em;">Cheers,
                          <br />The {{info.general_store_name}} team</p>
                        <!-- Action -->
                        <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 30px auto; padding: 0;">
                          <tr>
                            <td align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                              <!-- Border based button
           https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                                <tr>
                                  <td align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                                    {{!-- <a href="{{action_url}}" class="f-fallback button button--blue" target="_blank" style="color: #FFF; background-color: #3869D4; display: inline-block; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; border-color: #3869D4; border-style: solid; border-width: 10px 18px;">Download as PDF</a> --}}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!-- Sub copy -->
                        
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px;">
                <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="width: 570px; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center; margin: 0 auto; padding: 0;">
                  <tr>
                    <td class="content-cell" align="center" style="word-break: break-word; font-family: &quot;Nunito Sans&quot;, Helvetica, Arial, sans-serif; font-size: 16px; padding: 35px;">
                      <p class="f-fallback sub align-center" style="font-size: 13px; line-height: 1.625; text-align: center; color: #6B6E76; margin: .4em 0 1.1875em;" align="center">
                        {{info.general_store_name}}                       
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`),
    "template_text": base64_encode("[{{info.general_store_name}}] ({{info.general_store_website}})\n\n************\nHi {{order.contact.firstname}},\n************\n\nThank you for your purchase !!!\n\n\nOrder ID is {{order.id}}\n--------------\n\n{{date}}\n--------\n\nDescription\n\nItems\n{{#each order.line_items}}\n- {{data.title}} x {{qty}}\n{{/each}}\n\nShipping \n{{order.shipping_method.title}}, {{order.shipping_method.price}}\n\nDiscounts\n{{#each order.pricing.evo}}\n- {{discount.title}} - {{total_discount}}\n{{/each}}\n\nTotal\n{{order.pricing.total}}\n\nIf you have any questions about this receipt, simply reply to this \nemail or reach out to our support team ( {{ info.general_store_support_email }} ) for help.\n\nCheers,\nThe {{info.general_store_name}} team\n\n\n{{info.general_store_name}}\n{{info.general_store_website}}"),
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
    "updated_at": "2024-05-20T10:43:40.766Z",
    "_relations": {
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
  }
]