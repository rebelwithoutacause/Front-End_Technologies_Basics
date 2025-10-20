import { html } from "../../node_modules/lit-html/lit-html.js";
import { editEventById, getEvenetById } from "../api/data.js";

const editTamplate = (event, onSubmit) => html`
<section id="edit">
  <div class="form">
  <h2>Edit Event</h2>
  <form class="edit-form" @submit=${onSubmit} >
    <input
      type="text"
      name="name"
      id="name"
      placeholder="Event"
      value="${event.name}"
    />
    <input
      type="text"
      name="imageUrl"
      id="event-image"
      placeholder="Event Image"
      value="${event.imageUrl}"
    />
    <input
      type="text"
      name="category"
      id="event-category"
      placeholder="Category"
      value="${event.category}"
    />


    <textarea
      id="event-description"
      name="description"
      placeholder="Description"
      rows="5"
      cols="50"
    >${event.description}</textarea>
    
    <input
    type="text"
    name="date"
    id="date"
    placeholder="When?"
    value="${event.date}"
  />

    <button type="submit">Edit</button>
  </form>
  </div>
</section>
`;



export async function editPage(ctx) {
  const eventId = ctx.params.id;

  const event = await getEvenetById(eventId);
  ctx.render(editTamplate(event, onSubmit));

  async function onSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const editEvent = {
      name: formData.get("name").trim(),
      imageUrl: formData.get("imageUrl").trim(),
      category: formData.get("category").trim(),
      description: formData.get("description").trim(),
      date: formData.get("date").trim(),
    };

    if (Object.values(editEvent).some((x) => !x)) {
      return alert("All fields are required!");
    }

    await editEventById(eventId, editEvent);
    event.target.reset();
    ctx.page.redirect(`/details/${eventId}`);
  }
}
