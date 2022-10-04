<template>
    <div>
        <a-divider>Login</a-divider>

        <a-form name="basic" :label-col="{ span: 8 }" :wrapper-col="{ span: 8 }" autocomplete="off" >
            <a-form-item label="Username" name="username" >
                <a-input v-model:value="username" />
            </a-form-item>

            <a-form-item label="Password" name="password">
                <a-input-password v-model:value="password" />
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
                <a-button type="primary" @click="login">Login</a-button>
            </a-form-item>
        </a-form>

        <p>{{loginResult}}</p>
    </div>
</template>

<script setup>
//FUNCTIONAL REQUIREMENT 1: LOG INTO PORTAL
    const username = ref("")
    const password = ref("")
    const loginResult = ref("")
    const router = useRouter();

    const login = async () => {

        const {data: message} = await useAsyncData('message', () => 
            $fetch('/server-api/login', {
                method: 'POST',
                body: {
                    user: username.value,
                    pass: password.value
                }
            }), {initialCache: false}
        )

        if (message.value.result == "success") {
                router.push('/dashboard');
        }
        else {
            loginResult.value = "Error occurred logging in, please try again"
        }
        console.log(message)

    }
    

    
</script>