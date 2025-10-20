import { html } from "../../node_modules/lit-html/lit-html.js";
import { getAllEvents } from "../api/data.js";

const dashboardTemplate = (events) => html`<h2>Current Events</h2>
<section id="dashboard">
  ${events.length == 0
    ? html`<h4>No Events yet.</h4>`
    : events.map(
        (e) => html`       
        <div class="event">
    <img src="${e.imageUrl}" alt="example1" />
    <p class="title">
    ${e.name}
    </p>
    <p class="date">${e.date}</p>
    <a class="details-btn" href="/details/${e._id}">Details</a>
  </div>
        `
      )}
</section>`;


export async function dashboardPage(ctx) {
  const events = await getAllEvents();
  console.log(events);
  ctx.render(dashboardTemplate(events));
}
