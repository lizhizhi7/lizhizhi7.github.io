Procfile
.env
system.peoperties

heroku create (git push heroku master)
heroku open
heroku ps
            :scale {name}={n}
heroku logs --tail
hreoku local {name}
heroku config
            :set {key}={value}
heroku run
            bash/java --version
heroku addons
            :create <papertrail>
            :open <papertrail>
heroku pg
            :psql
            :info
heroku domains
            :add {domain}
            :remove {domain}
heroku certs
            :info
            :update
            :remove
            :add {xxx.crt xxx.key}
            :auto