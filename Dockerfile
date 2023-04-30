FROM mongo 

WORKDIR /data/dbDev

EXPOSE 27017

CMD ["mongod"]