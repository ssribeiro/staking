import time
from web3 import Web3
import json
import os

# Print iterations progress
def printProgressBar (iteration, total, prefix = '', suffix = '', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
        printEnd    - Optional  : end character (e.g. "\r", "\r\n") (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print(f'\r{prefix} |{bar}| {percent}% {suffix}', end = printEnd)
    # Print New Line on Complete
    if iteration == total: 
        print()

def get_contract_stakers(contract_address, outer_start_block, outer_end_block, eventSelector):
    with open('contract_abi.json') as f:
        contract_abi = json.load(f)
    contract = web3.eth.contract(address=contract_address, abi=contract_abi)

    # Get block range (e.g., from contract creation to latest block)
    block_delta = 10000
    start_block = outer_start_block
    end_block = outer_end_block

    total_iterations = (end_block - start_block) / block_delta

    print(f"Start: {start_block}, end: {end_block}, total iterations: {total_iterations}")

    # Process events to extract staker addresses and amounts
    printProgressBar(0, total_iterations, prefix = 'Progress:', suffix = 'Complete', length = 50)

    stakers = {}
    for i, x in enumerate(range(start_block, end_block + 1, block_delta), 1):
        printProgressBar(i, total_iterations, prefix = 'Progress:', suffix = 'Complete', length = 50)
        
        iter_start_block = x if x < end_block else end_block
        iter_end_block = iter_start_block + block_delta - 1 if (iter_start_block + block_delta - 1) < end_block else end_block
        
        # Get all events
        events = eventSelector(contract.events).get_logs(
            from_block=iter_start_block,
            to_block=iter_end_block)

        for event in events:
            staker_address = event['args']['user']
            amount = event['args']['amount'] / 100000000
            stakers[staker_address] = stakers.get(staker_address, 0) + amount
        
        time.sleep(0.001)
    
    print('\n')

    return stakers

DEPLOYMENT_BLOCK_NUMBER = 19924602 # add block number
YOUR_QUIK_NODE_PROJECT_ID = os.environ['QUIK_NODE_PROJECT_ID'] # add project id
END_BLOCK_NUMBER = os.environ.get('END_BLOCK_NUMBER') # add project id

# Connect to an Ethereum node (Infura, Alchemy, etc.)
quiknode_url = 'https://delicate-aged-dream.quiknode.pro/' + YOUR_QUIK_NODE_PROJECT_ID + '/'
web3 = Web3(Web3.HTTPProvider(quiknode_url))
current_end_block = web3.eth.block_number if END_BLOCK_NUMBER == None or END_BLOCK_NUMBER == '' else int(END_BLOCK_NUMBER)

print(f'Working on block till {current_end_block}')

# Contract details
contract_addresses = [
    ('0xE28c1a85268B081CbaeA8B71e3464E132aA8a0d4', 0),
    ('0xeC8FC8F622d5dA70162285FA76e896AB403BF1B3', 1),
    ('0xc8fee8f78aBC7ba5fF314091Dc64240Bdd36b794', 3),
    ('0x5E5A1Ee6BeA02D24B19C322006614902ED638Ba5', 6),
]

total_stakers = {}
for i, x in enumerate(contract_addresses):
    contract_address = x[0]
    stake_perdiod = x[1]

    current_stakers = get_contract_stakers(x[0], DEPLOYMENT_BLOCK_NUMBER, current_end_block, lambda a: a.Stake())

    for address, total_staked in current_stakers.items():
        current_state_for_address = total_stakers.get(address, {})
        current_state_for_address[stake_perdiod] = total_staked
        total_stakers[address] = current_state_for_address

total_unstakers = {}
for i, x in enumerate(contract_addresses):
    contract_address = x[0]
    stake_perdiod = x[1]

    current_stakers = get_contract_stakers(x[0], DEPLOYMENT_BLOCK_NUMBER, current_end_block, lambda a: a.Unstake())

    for address, total_staked in current_stakers.items():
        current_state_for_address = total_unstakers.get(address, {})
        current_state_for_address[stake_perdiod] = total_staked
        total_unstakers[address] = current_state_for_address

current_staks = {}
for address, total_staked in total_stakers.items():
    unstaked = total_unstakers.get(address, None)
    
    if unstaked != None:
        for period, staked in unstaked.items():
            total_staked[period] = total_staked.get(period, 0) - staked
    
    current_staks[address] = total_staked

print('\n')

# Output the stakers and their total staked amounts
header = sorted([i[1] for i in contract_addresses])
print(f'address,{",".join([str(i) for i in header])}')

for address, total_staked in current_staks.items():
    row = f"{address}"
    
    for item in header:
        row = f'{row},{total_staked.get(item, 0)}'

    print(f'{row}')

print(f'Completed')