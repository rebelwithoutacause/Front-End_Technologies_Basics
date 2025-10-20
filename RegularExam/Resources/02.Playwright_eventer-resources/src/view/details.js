import { html } from "../../node_modules/lit-html/lit-html.js";
import {
  deleteEventById,
  getEvenetById,
  getTotalGoes,
  didUserGo,
  go
} from "../api/data.js";

const detailsTamplate = (
  event,
  isOwner,
  onDelete,
  isLoggedIn,
  totalGoesCount,
  onClickGo,
  didUserGoin
) => html`
<section id="details">
          <div id="details-wrapper">
            <img id="details-img" src="${event.imageUrl}" alt="example1" />
            <p id="details-title">${event.name}</p>
            <p id="details-category">
              Category: <span id="categories">${event.category}</span>
            </p>
            <p id="details-date">
              Date: <span id="date">${event.date}</span></p>
            <div id="info-wrapper">
              <div id="details-description">
                <span>${event.description}</span>
              </div>
              <h3>Going: <span id="go">${totalGoesCount}</span> times.</h3>
              <div id="action-buttons">
      ${isOwner
        ? html`<a href="/edit/${event._id}" id="edit-btn">Edit</a>
            <a href="javascript:void(0)" id="delete-btn" @click=${onDelete}
              >Delete</a
            >`
        : ""}
      ${(() => {
        if (didUserGoin == 0) {
          if (isLoggedIn && !isOwner) {
            return html`<a href="javascript:void(0)"  @click=${onClickGo} id="go-btn">Going</a>`;
          }
        }
      })()}
    </div>
            </div>
`;

export async function detailsPage(ctx) {
  const eventId = ctx.params.id;
  const event = await getEvenetById(eventId);
  const user = ctx.user;

  let userId;
  let totalGoesCount;
  let didUserGoin;

  if (user != null) {
    userId = user._id;
    didUserGoin = await didUserGo(eventId, userId);
  }

  const isOwner = user && event._ownerId == user._id;
  const isLoggedIn = user !== undefined;

  totalGoesCount = await getTotalGoes(eventId);
  ctx.render(
    detailsTamplate(
      event,
      isOwner,
      onDelete,
      isLoggedIn,
      totalGoesCount,
      onClickGo,
      didUserGoin
    )
  );

  async function onClickGo() {
    const donation = {
       eventId,
    };
    await go(donation);

    totalGoesCount = await getTotalGoes(eventId);
    didUserGoin = await didUserGo(eventId, userId);
    ctx.render(
      detailsTamplate(
        event,
        isOwner,
        onDelete,
        isLoggedIn,
        totalGoesCount,
        onClickGo,
        didUserGo
      )
    );
  }

  async function onDelete() {
    const confirmed = confirm("Are you sure?");
    if (confirmed) {
      await deleteEventById(eventId);
      ctx.page.redirect("/dashboard");
    }
  }
}
