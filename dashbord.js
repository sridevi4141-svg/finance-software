function logout() {

    localStorage.removeItem("ownerLogin");

    window.location = "owner-login.html";

}