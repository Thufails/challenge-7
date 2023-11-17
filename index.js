const express = require('express'),
    cors = require('cors'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    PORT = process.env.PORT || 3000,
    router = require('./routers'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    Sentry = require('@sentry/node'),
    { ProfilingIntegration } = require('@sentry/profiling-node')

require('dotenv').config()

Sentry.init({
    dsn: 'https://d6eec2a20c0c6f12f5c4d337d2a69729@o4506243426680832.ingest.sentry.io/4506243453681664',
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());


app.use(morgan('combined'))
app.set('views', './views');
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(router);
// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.listen(PORT, () => console.log(`App is running at PORT ${PORT}`))

io.on('connect', (socket) => {
    console.log('user conected')
    socket.on('chat', (data) => {
        io.sockets.emit('chat', data)
    })
})