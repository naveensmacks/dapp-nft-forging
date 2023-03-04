# DAPP-NFT-FORGING
Spec Description
Integrating with metamask is fairly simple, much of the work this week will be on the front-end design. Here is what needs to be accomplished by the end:

There are three new concepts you must master:

Creating that transactions that return instantly (such as from a view or pure function)
Creating transactions that change the state of the blockchain and thus must be asynchronous. Dealing with an pending transactions is not trivial!
Changing the network of metamask to the appropriate one
You will build an ERC1155 token with a front-end. Here are the requirements:

You must have a total of 7 tokens within the collection id [0-6]
There is no supply limit for each token
Anyone can mint tokens [0-2], but there is a 1-minute cooldown between mints. These are free to mint except for the gas cost.
Token 3 can be minted by burning token 0 and 1.
Token 4 can be minted by burning token 1 and 2
Token 5 can be minted by burning 0 and 2
Token 6 can be minted by burning 0, 1, and 2
Tokens [4-6] cannot be forged into other tokens
Tokens [4-6] can be burned but you get nothing back
You can trade any token for [0-2] by hitting the trade this button.
The process of burning and minting is called forging in this context.
The webapp must tell the user how much matic they have (we will use the polygon network for cost savings)
The webapp must tell the user how much of each token they have
Provide a link to the OpenSea page somewhere
Important if the website detects someone is not on the polygon network, it must prompt them to change and autofill the feeds for changing the network (lesson on this later)
Important please use some styling on this website to make it look nice (bootstrap, tailwind CSS, etc). This is something you can show to future employers or business partners.
You must use 2 separate contracts. One for the ERC1155 token, and one for the forging logic. The forging logic will need mint privileges.
Warning: Start on this assignment early. The solidity code is easy to write, but the frontend integration and workflows will have a lot of unfamiliar problems we will not explicitly teach you about. It is inevitable that you will encounter them in this assignment, so start early!

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
