package dev.pingme.security;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Security;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import dev.pingme.repository.UserRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class DilithiumService {

    private final UserRepository userRepository;
    private final Map<Long, PrivateKey> privateKeyStore = new ConcurrentHashMap<>();

    public KeyPair generateKeyPair() {
        try {
            KeyPairGenerator kpg = KeyPairGenerator.getInstance("DILITHIUM3", "BC");
            return kpg.generateKeyPair();
        } catch (Exception e) {
            try {
                KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-DSA-65", "BC");
                return kpg.generateKeyPair();
            } catch (Exception ex) {
                throw new RuntimeException("Failed to initialize Dilithium KeyPairGenerator", ex);
            }
        }
    }

    public byte[] signMessage(byte[] message, PrivateKey privateKey) {
        try {
            Signature signer = Signature.getInstance("DILITHIUM3", "BC");
            signer.initSign(privateKey);
            signer.update(message);
            return signer.sign();
        } catch (Exception e) {
            try {
                Signature signer = Signature.getInstance("ML-DSA-65", "BC");
                signer.initSign(privateKey);
                signer.update(message);
                return signer.sign();
            } catch (Exception ex) {
                throw new RuntimeException("Failed to sign message using Dilithium", ex);
            }
        }
    }

    public boolean verifySignature(byte[] message, byte[] signature, PublicKey publicKey) {
        try {
            Signature verifier = Signature.getInstance("DILITHIUM3", "BC");
            verifier.initVerify(publicKey);
            verifier.update(message);
            return verifier.verify(signature);
        } catch (Exception e) {
            try {
                Signature verifier = Signature.getInstance("ML-DSA-65", "BC");
                verifier.initVerify(publicKey);
                verifier.update(message);
                return verifier.verify(signature);
            } catch (Exception ex) {
                log.warn("Dilithium verification failed: {}", ex.getMessage());
                return false;
            }
        }
    }

    public void storePrivateKey(Long userId, PrivateKey key) {
        privateKeyStore.put(userId, key);
    }

    public Optional<PrivateKey> getPrivateKey(Long userId) {
        return Optional.ofNullable(privateKeyStore.get(userId));
    }

    public String encodePublicKey(PublicKey publicKey) {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    public PublicKey decodePublicKey(String base64) {
        try {
            byte[] bytes = Base64.getDecoder().decode(base64);
            KeyFactory kf = KeyFactory.getInstance("DILITHIUM3", "BC");
            return kf.generatePublic(new X509EncodedKeySpec(bytes));
        } catch (Exception e) {
            try {
                byte[] bytes = Base64.getDecoder().decode(base64);
                KeyFactory kf = KeyFactory.getInstance("ML-DSA-65", "BC");
                return kf.generatePublic(new X509EncodedKeySpec(bytes));
            } catch (Exception ex) {
                log.error("Failed to decode public key: {}", ex.getMessage());
                return null;
            }
        }
    }

    @PostConstruct
    public void initSeedUserKeys() {
        Security.addProvider(new BouncyCastleProvider());
        log.info("Initialising Dilithium keys for seed users");

        List<String> seedUsernames = List.of("ajay", "bala", "chandra", "dinesh");

        for (String username : seedUsernames) {
            userRepository.findByUsername(username).ifPresent(user -> {
                try {
                    KeyPair kp = generateKeyPair();
                    String pubKeyBase64 = encodePublicKey(kp.getPublic());
                    user.setDilithiumPublicKey(pubKeyBase64);
                    userRepository.save(user);
                    storePrivateKey(user.getId(), kp.getPrivate());
                    log.info("Dilithium key ready for user: {}", username);
                } catch (Exception e) {
                    log.error("Failed to init key for {}: {}", username, e.getMessage());
                }
            });
        }
    }
}
