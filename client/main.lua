

RegisterNuiCallback("close", function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

function OpenUI()
    SendNUIMessage({ type = "resName", data = GetCurrentResourceName() })
    SendNUIMessage({ type = "open" })
    SetNuiFocus(true, true)
end

RegisterCommand("openui", function()
    OpenUI()
end)