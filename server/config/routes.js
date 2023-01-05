

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.json({ message: 'REST Service Operational'});
    })
}