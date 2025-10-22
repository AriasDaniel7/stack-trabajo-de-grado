FROM caddy:2.10-alpine
# COPY --from=builder /usr/bin/caddy /usr/bin/caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY ./certs /etc/ssl/certs

EXPOSE 80
EXPOSE 443