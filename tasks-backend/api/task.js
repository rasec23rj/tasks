const moment = require('moment')

module.exports = app => {

    const getTasks = (req, res) => {
        const date = req.query.date ? req.query.date : moment().endOf('day').toDate()
     
    app.db('tasks')
    .where({userId: req.user.id})
    .where('estimateAt', '<=', date)
    .orderBy('estimateAt')
    .then(tasks =>  res.json(tasks))
    .catch(err => res.status(500).json(err))
    
    }

    const save = (req,res) => {
        if(!req.body.desc.trim()){
            return res.status(400).send('Descricao e um campo obrigatorio')
        }
        console.log(req.user.id);
      

        req.body.userId = req.user.id
       
        app.db('tasks')
        .insert(req.body)
        .then(_=>res.status(204).send(`Task sava com sucesso.`))
        .catch(err => res.status(400).json(err))
    }

    const remove = (res, req) => {
        console.log(req.req.params.id)
        app.db('tasks')
        .where({ id: req.req.params.id, userId: req.req.user.id })
        .del()
        .then(rowsDeleted => {
            if (rowsDeleted > 0) {
                res.status(204).send()
            }else{
                const msg = `Não foi encontrado rask com id ${req.req.params.id}.`
                res.status(400).send(msg)
            }
        })
    }

    const updateTaskDoneAt = (req, res, doneAt) =>  {
        app.db('tasks')
        .where({ id: req.params.id, userId: req.user.id })
        .update({ doneAt})
        .then(_ => res.status(204).send())
        .catch(err => res.status(400).json(err))
    }
    const toggleTask = (res, req) => {
        app.db('tasks')
        .where({ id:req.req.params.id, userId: req.req.user.id })
        .first()
        .then(task => {
            if (!task) {
                const msg = `Task com id  ${req.req.params.id}`
                return res.status(400).send(msg)
            }
            const doneAt = task.doneAt ? null : new Date()
            updateTaskDoneAt(req,res,doneAt)
        }).catch(err => res.status(400).json(err))
    }

    return {getTasks, save, remove, toggleTask}
}