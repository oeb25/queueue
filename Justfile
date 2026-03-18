static-build:
    npm i
    VITE_API_URL="/graphql" npm run build
    cargo zigbuild --target x86_64-unknown-linux-gnu --release
