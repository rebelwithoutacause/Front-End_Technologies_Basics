import * as api from "./api.js";

const host = "http://localhost:3030";
api.settings.host = host;

export const login = api.login;
export const register = api.register;
export const logout = api.logout;

// Application-specific request
// get all listings
export async function getAllEvents() {
  return await api.get(host + "/data/events?sortBy=_createdOn%20desc");
}

// get listing by id
export async function getEvenetById(id) {
  return await api.get(host + `/data/events/${id}`);
}

// create listing
export async function addEvent(event) {
  return await api.post(host + "/data/events", event);
}

// edit listing by id
export async function editEventById(id, event) {
  return await api.put(host + `/data/events/${id}`, event);
}

// delete listing by id
export async function deleteEventById(id) {
  return await api.del(host + `/data/events/${id}`);
}

export async function go(eventId) {
  return await api.post(host + `/data/going`, eventId);
}

export async function getTotalGoes(eventId) {
  return await api.get(
    host +
      `/data/going?where=eventId%3D%22${eventId}%22&distinct=_ownerId&count`
  );
}

export async function didUserGo(eventId, userId) {
  return await api.get(
    host +
      `/data/going?where=eventId%3D%22${eventId}%22%20and%20_ownerId%3D%22${userId}%22&count`
  );
}
