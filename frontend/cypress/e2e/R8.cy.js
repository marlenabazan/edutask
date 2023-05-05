describe('R8', () => {
  // define variables that we need on multiple occasions
  let uid // user id
  let name // name of the user (firstName + ' ' + lastName)
  let email // email of the user
  let title // title of a task
  let url // url of a task
  const description = 'Description test'
  let todos

  before(function () {
    // create a fabricated user from a fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          name = user.firstName + ' ' + user.lastName
          email = user.email
        })
      })
  })

  before(function () {
    // create a fabricated task from a fixture
    cy.fixture('task.json')
      .then((task) => {
        task.userid = uid
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/tasks/create',
          form: true,
          body: task
        }).then((response) => {
          title = response.body[0].title
          url = task.url
          todos = task.todos
          cy.log("RESPONSE BODY", response.body[0]);
        })
      })
  })


  // ----- PRECONDITIONS ----- //

  beforeEach(function () {
    // enter the main main page
    cy.visit('http://localhost:3000')

    // make sure the landing page contains a header with "login"
    cy.get('h1')
      .should('contain.text', 'Login')

    // detect a div which contains "Email Address", find the input and type (in a declarative way)
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email)

    // submit the form on this page
    cy.get('form')
      .submit()

    // assert that the user is now logged in and has one task
    cy.get('p')
      .should('contain.text', 'Here you can find')
    cy.get('img')
      .should('be.visible')
      .click()

    // shows the task in detail view mode
    cy.get('.popup-inner')
      cy.get('h1')
      .should('contain.text', title)

    // assert that the user has one todo
    cy.get('.todo-list')
      .should('contain.text', todos)
  })


  // ----- TESTS ----- //

  it('R8UC1 disabled "Add" button when empty description', () => {
    cy.get('.popup-inner')
      .find('input[type="text"]')
      .should('have.attr', 'value', '')

    cy.get('.popup-inner')
      .find('input[type=submit]')
      .should('be.disabled')
  })

  it('R8UC1 enter description and create new todo item', () => {
    cy.get('.popup-inner')
        .find('input[type="text"]')
        .type(description)
        .should('have.value', description)

    cy.get('.popup-inner')
      .find('input[type="submit"]')
      .click()
  })

  it('R8UC1 append new todo item to the list', () => {
    cy.get('.todo-list li:nth-last-child(2)')
      .should('contain.text', description)
  })


  it('R8UC2 click an active todo checker', () => {
    cy.get('.todo-list li:nth-last-child(2)')
      .find('.checker')
      .should('have.class', 'unchecked')
      .click()
  })

  it('R8UC2 click a done todo checker', () => {
    cy.get('.todo-list li:nth-last-child(2)')
      .find('.checker')
      .should('have.class', 'checked')

    cy.get('.todo-list li:nth-last-child(2)')
        .find('span.editable')
        .should('have.css', 'text-decoration', 'line-through solid rgb(49, 46, 46)')

    cy.get('.todo-list li:nth-last-child(2)')
      .find('.checker')
      .click()

    cy.get('.todo-list li:nth-last-child(2)')
      .find('.checker')
      .should('have.class', 'unchecked')

    cy.get('.todo-list li:nth-last-child(2)')
      .find('span.editable')
      .should('have.css', 'text-decoration', 'none solid rgb(49, 46, 46)')
  })


  it('R8UC3 click the x symbol to delete a todo', () => {
    cy.get('.todo-list li:nth-last-child(2)')
      .find('.remover')
      .click()

    cy.contains('.todo-list li', description)
      .should('not.exist')
  })


  after(function () {
    // clean up by deleting the user from the database
    cy.request({
      method: 'DELETE',
      url: `http://localhost:5000/users/${uid}`
    }).then((response) => {
      cy.log(response.body)
    })
  })
})
