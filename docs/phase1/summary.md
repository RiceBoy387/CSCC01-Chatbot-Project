group project:

The objective of this project is to create a chatbot that is able to update itself
given a link for new information and interface with users. To do this, there needs
to be 4 components that needs to be implemented at the beginning which is the following:

  - Crawler for the crawling information from websites:
    - An admin can give the crawler a link that will contain information that may be useful for the chat bot. The crawler will use this link and pull information out of this link so that it can be used to update the model for the bot.
      - using chrome and selenium
      - it appears that this would be more java base (hence we should use mvn and TDD for developing our tool)

  - Model for the chat bot:
    - Using the information crawled from websites, they first need to be cleaned. Then use a natural language processing library to train and create a model for the chat bot to respond to users.
    - cleaning:
      - from the data retrieved from our crawler, we first need to tag/clean (ex. removing stop words)
    - from the cleaned data, build the ML model
    - to train the ML model, we have a few libraries available to use:
      - sklearn appears to be easiest to use
      - tensorflow and pytorch



once we have finished training the chat bot:

  - backend:
    - we should build a back end that will handle the the input and output from the front end
    - for example, we can have a REST api for for the front end to input their data and send a reply for what the response of the chat bot
    - handle the authentication of the users
    - take links from admins for data to be crawled
    - train the model with respect to newly crawled data

  - frontend:
	- an interface for communicating with the back end
		perhaps reactjs that changes the page dynamically
	- simple interface for displaying the chat history
	- upon the user's input, it will send a request to the server
	and the server will respond to the request
	- once the front end receive the response, update/render a new display
	updating the user for what it would be like

Once the 4 components are completed, the backend will take over task that
is handled by the crawler as well as the model for the chat bot. At this point
the back end should be able to handle everything specified above. 


Personas:

	1. Nakamoto Satoshi senior personnel working at the government of Canada, does not love technology but but is responsible for monitoring our financial sector, which includes all of our FinTech start up companies.
	
	2. Katherine Delaware, student from the University of Toronto, recenlty off of her professional experience year, she is exploring options for what she can do with the money she earned.

	3. Billy Vanilli, employee at DFI who initiated the chatbot project, believes DFI should be the hub for all things FinTech throughout Canada and believes that the chatbot is the path to that future.
