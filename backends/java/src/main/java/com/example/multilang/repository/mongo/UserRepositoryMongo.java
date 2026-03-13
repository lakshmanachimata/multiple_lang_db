package com.example.multilang.repository.mongo;

import com.example.multilang.domain.User;
import com.example.multilang.repository.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.UUID;

@Repository
@Qualifier("mongo")
public class UserRepositoryMongo implements UserRepository {
    private final MongoTemplate mongoTemplate;

    public UserRepositoryMongo(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public User save(User user) {
        UserDocument doc = new UserDocument(
                user.getId() != null ? user.getId() : UUID.randomUUID().toString(),
                user.getEmail(),
                user.getPasswordHash()
        );
        UserDocument saved = mongoTemplate.save(doc);
        return new User(saved.getId(), saved.getEmail(), saved.getPasswordHash());
    }

    @Override
    public Optional<User> findByEmail(String email) {
        UserDocument doc = mongoTemplate.findOne(
                Query.query(Criteria.where("email").is(email)),
                UserDocument.class
        );
        return doc != null ? Optional.of(new User(doc.getId(), doc.getEmail(), doc.getPasswordHash())) : Optional.empty();
    }

    @Override
    public Optional<User> findById(String id) {
        UserDocument doc = mongoTemplate.findById(id, UserDocument.class);
        return doc != null ? Optional.of(new User(doc.getId(), doc.getEmail(), doc.getPasswordHash())) : Optional.empty();
    }
}
