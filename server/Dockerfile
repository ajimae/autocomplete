FROM node:latest

WORKDIR /server

COPY . .

RUN ["npm", "install"]

EXPOSE 3001

CMD ["npm", "start"]
# RUN chmod +x ./start.sh

# ENTRYPOINT ["./start.sh"]