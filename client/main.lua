
Citizen.CreateThread(function()
    SendNuiMessage({
        type = "resName",
        data = GetCurrentResourceName()
    })
end)

RegisterNuiCallback("close", function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

function OpenUI()
    SetNuiFocus(true, true)
    SendNUIMessage({ type = "open" })
end