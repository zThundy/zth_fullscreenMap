

local dicts = {
    [1] = {
        dict = "amb@world_human_tourist_map@male@base",
        anim = "base",
        prop = "prop_tourist_map_01",
    },
    [2] = {
        dict = "amb@world_human_tourist_map@male@idle_a",
        anim = "idle_a",
        prop = "prop_tourist_map_01",
    }
}

local obj = nil

RegisterNuiCallback("close", function(data, cb)
    SetNuiFocus(false, false)
    ClearPedTasks(PlayerPedId())
    DeleteEntity(obj)
    cb('ok')
end)

function PlayAnim()
    math.randomseed(GetGameTimer())

    local random = math.random(1, #dicts)
    local dict = dicts[random].dict
    local anim = dicts[random].anim
    local prop = dicts[random].prop

    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Citizen.Wait(0)
    end

    TaskPlayAnim(PlayerPedId(), dict, anim, 8.0, 8.0, -1, 1, 0, false, false, false)

    RequestModel(prop)
    while not HasModelLoaded(prop) do
        Citizen.Wait(0)
    end

    local boneIndex = GetPedBoneIndex(PlayerPedId(), 28422)
    local coords = GetPedBoneCoords(PlayerPedId(), boneIndex)

    obj = CreateObject(GetHashKey(prop), coords.x, coords.y, coords.z, true, true, true)
    AttachEntityToEntity(obj, PlayerPedId(), boneIndex, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, true, true, false, true, 1, true)
end

function OpenUI()
    PlayAnim()

    SendNUIMessage({ type = "resName", data = GetCurrentResourceName() })
    SendNUIMessage({ type = "open" })
    SetNuiFocus(true, true)
end

RegisterCommand("openui", function()
    OpenUI()
end)