

<template>
    <div>
        <a-typography-title>Edit Your Profile</a-typography-title>
        <a-form>
            <a-form-item label="Name">
            <a-input v-model:value="nameField" placeholder="Enter your name" />
            </a-form-item>
            <a-form-item label="Address">
            <a-input v-model:value="addressField" placeholder="Enter your address" />
            </a-form-item>
            <a-form-item>
            <a-button type="primary" @click="updateProfile">Submit</a-button>
            </a-form-item>
        </a-form>
        <a-button @click="test">hello</a-button>
    </div>
</template>

<script setup>
    const nameField = ref("")
    const addressField = ref("")
    const test = async () => {
        const {data: message} = await useAsyncData('message', () => $fetch('/server-api/get_profile'))
        //TODO: the fetch is too early that the session is not ready?
        console.log(message)
        if (message.value.result == "success") {
            var data = JSON.parse(message.value.message)
            console.log(data[0])
            nameField.value = data[0].name
            addressField.value = data[0].address
        }
        else {
            console.log("fail")
        }
    }

    const updateProfile = async () => {
        const {data: message} = await useAsyncData('message', () => $fetch('/server-api/get_profile'))
        //TODO: the fetch is too early that the session is not ready?
        console.log(message)
        if (message.value.result == "success") {
            var data = JSON.parse(message.value.message)
            console.log(data[0])
            nameField.value = data[0].name
            addressField.value = data[0].address
        }
        else {
            console.log("fail")
        }
    }
</script>