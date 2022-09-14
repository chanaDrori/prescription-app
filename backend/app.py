import json
import requests
import ast
from flask import Flask, jsonify, request, Response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def get_list_drugs(text: str) -> "list[dict]":
    response_drugs: list = ast.literal_eval(text)
    list_drugs: list[dict] = []
    if len(response_drugs) > 1:
        for i in range(len(response_drugs[1])):
            id_list = response_drugs[2].get('RXCUIS', [])
            list_drugs.append({
                "name": response_drugs[1][i],
                "id": "+".join(id_list[i])
            })
    return list_drugs


def is_valid_term(term: str):
    # TODO
    return True

def is_valid_ids(ids_str:str):
    # TODO
    return True


@app.route('/api/search')
def search():
    term = request.args.get('txt', "")
    if not is_valid_term(term):
        return Response(
            "The term isn't valid, please try again",
            status=400,
        )
    # https://clinicaltables.nlm.nih.gov/apidoc/rxterms/v3/doc.html
    request_url: str = "https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms={}&ef=RXCUIS"
    try:
        response_drugs = requests.get(request_url.format(term))
    except Exception as ex:
        return Response(
            "The service is unavailable. " + str(ex),
            status=503,
        )
    if response_drugs.status_code == 200:
        list_drugs = get_list_drugs(response_drugs.text)
        return {'data': list_drugs}
    else:
        return Response(
            "ERROR: from clinicaltables API return " +
            str(response_drugs.status_code),
            status=response_drugs.status_code
        )


@app.route('/api/add', methods=['GET'])
def add():
    # ids: list[str] = ['1011646', '731536', '1305100']
    # ids_str: str = "+".join(ids)
    ids = request.args.get('ids', "")
    if not is_valid_ids(ids):
        return Response(
            "The id isn't valid, please try again",
            status=400,
        )
    ids_str = ids.replace(",", "+").replace(" ", "+")
    # https://lhncbc.nlm.nih.gov/RxNav/APIs/api-Interaction.findInteractionsFromList.html
    search_warning_url = f"https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis={ids_str}"
    try:
        response_warning = requests.get(search_warning_url)
    except Exception as ex:
        return Response(
            "The service is unavailable. " + str(ex),
            status=503,
        )
    if response_warning.status_code == 200:
        result_all = []
        json_object = json.loads(response_warning.text)
        fullInteractionTypeGroup = json_object.get(
            "fullInteractionTypeGroup", [])
        for group in fullInteractionTypeGroup:
            fullInteractionType = group.get("fullInteractionType", [])
            for interaction in fullInteractionType:
                pair = interaction.get("interactionPair", [])
                for warn in pair:
                    result_all.append({
                        "severity": warn.get("severity", "N/A"),
                        "description": warn.get("description", "N/A"),
                    })
        # filter duplicates
        seen = set() 
        result = []
        for r in result_all:
            if r.get('description') not in seen:
                seen.add(r['description'])
                result.append(r)
        return jsonify(data=result)
    else:
        return Response(
            "ERROR: from clinicaltables API return " +
            str(response_warning.status_code),
            status=response_warning.status_code
        )


if __name__ == "__main__":
    app.run(debug=True)
