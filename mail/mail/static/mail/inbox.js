document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


  document.querySelector("#compose-form").addEventListener("submit", send_email);

});


function send_email(event){

  event.preventDefault();

  const reps = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: reps,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      // console.log(result);
      load_mailbox("inbox");
  });

}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h1>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h1>`;

  // console.log(mailbox);
  fetch(`/emails/${mailbox}`)
  .then((response) => response.json())
  .then((emails) => {

    emails.forEach((element) => {

      // console.log(element);

      if (mailbox != "sent") {
        sender_recipients = element.sender;
      } else {
        sender_recipients = element.recipients;
      }

      if (mailbox == "inbox") {
        if (element.read) is_read = "read";
        else is_read = "";
      } else is_read = "";
      var item = document.createElement("div");
      item.className = `card   ${is_read} my-1 items`;

      item.innerHTML = `<div class="card-body" id="item-${element.id}">
      
      ${element.subject} | ${sender_recipients} | ${element.timestamp}
      <br>
      ${element.body.slice(0, 100)}

      
      </div>`;
      document.querySelector("#emails-view").appendChild(item);

      // add event listener to this specific email so when someone clicks, it takes them to another
      // page and display this individual email using their email ID
      item.addEventListener("click", () => {
        show_mail(element.id, mailbox);
      });
    })
    
  });
  
}

function show_mail(id, mailbox){
  fetch(`/emails/${id}`)
  .then((response) => response.json())
  .then((emails) => {

    // console.log(emails);
  document.querySelector("#emails-view").innerHTML = "";
  var item = document.createElement("div");
  item.className = `card`;
  item.innerHTML = `<div class="card-body" style="white-space: pre;">
  Sender: ${emails.sender}
  Recipients: ${emails.recipients}
  Subject: ${emails.subject}
  Time: ${emails.timestamp}
  <br>
  ${emails.body}
  </div>`;
  document.querySelector("#emails-view").appendChild(item);

  if (mailbox=="sent") return;

  // Button for Archieving an Email
  let archive = document.createElement("btn");

  archive.className = `btn btn-outline-info my-2`;

  archive.addEventListener("click", () => {

    archive_email(id, emails.archived);
    if (archive.innerText == "Archive") archive.innerText = "Unarchive";
    else archive.innerText = "Archive";
    load_mailbox("inbox")
  });

  if (!emails.archived) archive.textContent = "Archive";
  else archive.textContent = "Unarchive";

  document.querySelector("#emails-view").appendChild(archive);



  // Button for Replying to an Email!

  let reply = document.createElement("btn");

  reply.className = `btn btn-outline-success my-2`;
  reply.textContent = "Reply";

  reply.addEventListener("click", () => {
    reply_email(emails.recipients, emails.subject, emails.body, emails.timestamp, emails.sender);
  });

  document.querySelector("#emails-view").appendChild(reply);

  // make the email read
  read_email(id) 

  })
}

function reply_email(receps, subject, body, timestamp, sender){


  compose_email()

  if (!/^Re:/.test(subject)) subject = `Re: ${subject}`;
  document.querySelector("#compose-recipients").value = sender;
  document.querySelector("#compose-subject").value = subject;

  pre_fill = `On ${timestamp} ${sender} wrote:\n${body}\n`;

  document.querySelector("#compose-body").value = pre_fill;
  
}


function archive_email(id, state){
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: !state
    })
  })
}

function read_email(id) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

