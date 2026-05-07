package com.project.gogreen.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.gogreen.enums.Role;
import com.project.gogreen.model.User;
import com.project.gogreen.repo.UserRepository;

@Service
public class JwtUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository repo;

    // @Lazy breaks the circular dependency cycle
    @Autowired
    @Lazy
    private PasswordEncoder bcryptEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repo.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        SimpleGrantedAuthority authority =
                new SimpleGrantedAuthority(user.getRole().name());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(authority)
        );
    }

    public User save(User user) {
        Role role = (user.getRole() != null) ? user.getRole() : Role.ROLE_BUYER;

        User newUser = new User(
                user.getUsername(),
                bcryptEncoder.encode(user.getPassword()),
                user.getEmail(),
                user.getName(),
                user.getAddress(),
                user.getPhone(),
                role
        );
        return repo.save(newUser);
    }
}